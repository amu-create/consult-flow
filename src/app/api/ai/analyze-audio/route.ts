import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
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

      const contextInfo = context ? `\n학생 정보: ${context}` : "";

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: geminiFile.mimeType,
            fileUri: geminiFile.uri,
          },
        },
        {
          text: `이 음성은 학원 상담 통화 녹음입니다. 대화 내용을 분석해주세요.${contextInfo}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "transcript": "대화 내용을 깔끔하게 정리 (상담사/학부모 구분)",
  "summary": "상담 핵심 요약 (3-4문장)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "parentConcerns": ["학부모가 걱정/관심 보인 사항들"],
  "positiveSignals": ["등록 가능성을 높이는 긍정 신호들"],
  "negativeSignals": ["등록을 방해할 수 있는 부정 신호들"],
  "interestScore": 1~10 사이 정수,
  "conversionProbability": 0~100 사이 정수,
  "suggestedActions": ["추천 후속 조치 1", "추천 후속 조치 2"],
  "talkingPoints": ["다음 상담 시 언급하면 좋을 포인트들"]
}`,
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

      return Response.json({
        success: true,
        inputType: "audio",
        extractedText: parsed.transcript,
        ...parsed,
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
