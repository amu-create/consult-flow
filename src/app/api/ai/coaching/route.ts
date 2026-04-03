import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { askGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { consultationContent } = await request.json();

    if (!consultationContent) {
      return Response.json(
        { error: "consultationContent는 필수입니다." },
        { status: 400 }
      );
    }

    const prompt = `당신은 학원 상담 코칭 전문가입니다. 다음 상담 내용을 분석하여 상담사의 커뮤니케이션 품질을 평가하고 코칭 피드백을 제공해주세요.

상담 내용:
${consultationContent}

평가 기준:
1. 공감 표현 - 학부모의 걱정에 공감하고 있는지
2. 경청 - 학부모의 말을 잘 듣고 반영하는지
3. 전문성 - 교육 전문가로서의 신뢰감을 주는지
4. 해결 제시 - 구체적인 학습 방안을 제안하는지
5. 클로징 - 다음 단계로의 자연스러운 유도가 있는지

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "overallScore": 1~10 사이 정수,
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선할 점 1", "개선할 점 2"],
  "suggestedPhrases": ["추천 멘트 1 - 상황 설명과 함께", "추천 멘트 2 - 상황 설명과 함께"],
  "emotionalTone": "상담의 전반적인 감정 톤 분석 (예: 차분하지만 공감이 부족한 톤)"
}`;

    const raw = await askGemini(prompt);
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return Response.json(
        { error: "AI 응답 파싱 실패", detail: cleaned.slice(0, 500) },
        { status: 500 }
      );
    }

    return Response.json({ success: true, ...result });
  } catch (err) {
    console.error("[ai-coaching] error:", err);
    return Response.json(
      {
        error: "상담 코칭 분석에 실패했습니다.",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
