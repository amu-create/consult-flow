import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const { fileUri, mimeType, context } = await request.json();

    if (!fileUri) {
      return Response.json({ error: "파일 URI가 필요합니다." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Transcribe
    const transcribeResult = await model.generateContent([
      { fileData: { mimeType: mimeType || "audio/mpeg", fileUri } },
      { text: "이 음성은 학원 상담 통화 녹음입니다. 대화 내용을 텍스트로 변환해주세요. 상담사와 학부모를 구분해서 작성하세요." },
    ]);
    const transcript = transcribeResult.response.text();

    if (!transcript) {
      return Response.json({ error: "음성에서 텍스트를 추출할 수 없습니다." }, { status: 400 });
    }

    // Analyze
    const contextInfo = context ? `\n학생 정보: ${context}` : "";
    const analysisResult = await model.generateContent(`당신은 학원 상담 전문 AI 분석가입니다. 다음 상담 내용을 분석해주세요.${contextInfo}

상담 내용:
${transcript}

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
}`);

    const raw = analysisResult.response.text();
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: "AI 응답 파싱 실패", detail: cleaned.slice(0, 500) }, { status: 500 });
    }

    return Response.json({
      success: true,
      inputType: "audio",
      extractedText: transcript,
      ...result,
    });
  } catch (err) {
    console.error("[analyze-audio] error:", err);
    return Response.json(
      { error: "음성 분석에 실패했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
