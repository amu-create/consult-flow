import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { buildAudioAnalysisPrompt } from "@/lib/gemini";
import { del } from "@vercel/blob";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export const maxDuration = 60; // Allow up to 60s for long audio

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const { blobUrl, mimeType, context } = await request.json();

    if (!blobUrl) {
      return Response.json({ error: "파일 URL이 필요합니다." }, { status: 400 });
    }

    // Download from Vercel Blob
    const blobRes = await fetch(blobUrl);
    if (!blobRes.ok) {
      return Response.json({ error: "파일 다운로드 실패" }, { status: 400 });
    }

    const buffer = Buffer.from(await blobRes.arrayBuffer());
    const tmpPath = path.join(os.tmpdir(), `cf-audio-${Date.now()}.webm`);
    fs.writeFileSync(tmpPath, buffer);

    try {
      // Upload to Gemini File API
      const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
      const uploadResult = await fileManager.uploadFile(tmpPath, {
        mimeType: mimeType || "audio/webm",
        displayName: `consultation-${Date.now()}`,
      });

      let geminiFile = uploadResult.file;

      // Wait for processing (max 30s)
      let waitCount = 0;
      while (geminiFile.state === "PROCESSING" && waitCount < 15) {
        await new Promise((r) => setTimeout(r, 2000));
        geminiFile = await fileManager.getFile(geminiFile.name);
        waitCount++;
      }

      if (geminiFile.state === "FAILED") {
        return Response.json({ error: "음성 파일 처리에 실패했습니다." }, { status: 400 });
      }

      // Transcribe + Analyze with Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: geminiFile.mimeType,
            fileUri: geminiFile.uri,
          },
        },
        {
          text: buildAudioAnalysisPrompt(context),
        },
      ]);

      const raw = result.response.text();
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        return Response.json({ error: "AI 응답 파싱 실패", detail: cleaned.slice(0, 500) }, { status: 500 });
      }

      // Cleanup Gemini file
      try { await fileManager.deleteFile(geminiFile.name); } catch { /* ignore */ }

      // Cleanup Vercel Blob
      try { await del(blobUrl); } catch { /* ignore */ }

      // Clean up SRT-style timestamps: "00:00:05,000 --> 00:00:08,000" → "[0:05]"
      function cleanTranscript(text: string): string {
        if (!text) return text;
        return text
          // "00:00:05,000 --> 00:00:08,000\n내용" → "[0:05] 내용"
          .replace(/(\d{2}):(\d{2}):(\d{2})[,.]?\d{0,3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]?\d{0,3}\s*\n?/g,
            (_, h, m, s) => {
              const mins = parseInt(h) * 60 + parseInt(m);
              return `[${mins}:${s.padStart(2, "0")}] `;
            })
          // Standalone "00:00:05,000" → "[0:05]"
          .replace(/(?:^|\n)(\d{2}):(\d{2}):(\d{2})[,.]?\d{0,3}(?:\s*$|\s*\n)/gm,
            (_, h, m, s) => {
              const mins = parseInt(h) * 60 + parseInt(m);
              return `\n[${mins}:${s.padStart(2, "0")}] `;
            })
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }

      const cleanedTranscript = cleanTranscript(parsed.transcript);

      return Response.json({
        success: true,
        inputType: "audio",
        extractedText: cleanedTranscript,
        ...parsed,
        transcript: cleanedTranscript,
      });
    } finally {
      try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
    }
  } catch (err) {
    console.error("[analyze-audio] error:", err);
    return Response.json(
      { error: "음성 분석에 실패했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
