import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { askGemini } from "@/lib/gemini";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let type = "text";
    let text: string | null = null;
    let file: File | null = null;
    let context: string | null = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await request.json();
      type = json.type || "text";
      text = json.text || null;
      context = json.context || null;
    } else {
      const formData = await request.formData();
      type = (formData.get("type") as string) || "text";
      text = formData.get("text") as string | null;
      file = formData.get("file") as File | null;
      context = formData.get("context") as string | null;
    }

    console.log("[ai-analyze] type:", type, "hasText:", !!text, "textLen:", text?.length, "hasFile:", !!file);

    if (!GEMINI_API_KEY) {
      return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    let analysisText = "";

    if (type === "text" && text) {
      analysisText = text;
    } else if (type === "image" && file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";

      const res = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: "이 이미지는 카카오톡 또는 메신저 대화 캡처입니다. 대화 내용을 그대로 텍스트로 추출해주세요. 발화자와 내용을 구분해서 작성하세요." },
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      });

      const data = await res.json();
      console.log("[ai-analyze] vision response:", JSON.stringify(data).slice(0, 300));
      analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      if (!analysisText) {
        return Response.json({ error: "이미지에서 텍스트를 추출할 수 없습니다.", detail: JSON.stringify(data).slice(0, 300) }, { status: 400 });
      }
    } else if (type === "audio" && file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "audio/webm";

      const res = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: "이 음성은 학원 상담 통화 녹음입니다. 대화 내용을 텍스트로 변환해주세요. 상담사와 학부모를 구분해서 작성하세요." },
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
        }),
      });

      const data = await res.json();
      console.log("[ai-analyze] audio response:", JSON.stringify(data).slice(0, 300));
      analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      if (!analysisText) {
        return Response.json({ error: "음성에서 텍스트를 추출할 수 없습니다.", detail: JSON.stringify(data).slice(0, 300) }, { status: 400 });
      }
    } else {
      return Response.json({ error: "텍스트, 이미지, 또는 음성 파일을 입력해주세요." }, { status: 400 });
    }

    const contextInfo = context ? `\n학생 정보: ${context}` : "";
    const prompt = `당신은 학원 상담 전문 AI 분석가입니다. 다음 상담 내용을 분석해주세요.${contextInfo}

상담 내용:
${analysisText}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "transcript": "정리된 대화 내용 (원문이 아닌 깔끔하게 정리된 버전)",
  "summary": "상담 핵심 요약 (3-4문장)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "parentConcerns": ["학부모가 걱정/관심 보인 사항들"],
  "positiveSignals": ["등록 가능성을 높이는 긍정 신호들"],
  "negativeSignals": ["등록을 방해할 수 있는 부정 신호들"],
  "interestScore": 1~10 사이 정수,
  "conversionProbability": 0~100 사이 정수,
  "suggestedActions": ["추천 후속 조치 1", "추천 후속 조치 2"],
  "talkingPoints": ["다음 상담 시 언급하면 좋을 포인트들"]
}`;

    console.log("[ai-analyze] calling gemini, prompt length:", prompt.length);
    const raw = await askGemini(prompt);
    console.log("[ai-analyze] gemini raw:", raw.slice(0, 200));
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: "AI 응답 파싱 실패", detail: cleaned.slice(0, 500) }, { status: 500 });
    }

    return Response.json({
      success: true,
      inputType: type,
      extractedText: type !== "text" ? analysisText : undefined,
      ...result,
    });
  } catch (err) {
    console.error("[ai-analyze] unhandled error:", err);
    return Response.json(
      { error: "서버 오류가 발생했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
