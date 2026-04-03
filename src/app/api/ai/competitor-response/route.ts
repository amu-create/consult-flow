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

    const { competitorName, parentConcern, ourStrengths } =
      await request.json();

    if (!competitorName || !parentConcern) {
      return Response.json(
        { error: "competitorName과 parentConcern은 필수입니다." },
        { status: 400 }
      );
    }

    const prompt = `당신은 학원 상담 전략 전문가입니다. 학부모가 경쟁 학원을 언급했을 때 효과적으로 대응할 수 있는 상담 전략을 제시해주세요.

경쟁 학원: ${competitorName}
학부모 우려사항: ${parentConcern}
${ourStrengths ? `우리 학원 강점: ${ourStrengths}` : ""}

중요 원칙:
- 경쟁사를 직접적으로 비하하지 않기
- 학부모의 관심사에 집중하기
- 우리 학원만의 차별점을 강조하기
- 학생에게 최선인 선택을 돕는 자세 유지

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "responses": ["대응 멘트 1 - 구체적인 상황에서 사용할 수 있는 문구", "대응 멘트 2", "대응 멘트 3"],
  "keyDifferentiators": ["차별화 포인트 1", "차별화 포인트 2", "차별화 포인트 3"],
  "avoidSaying": ["이런 말은 피하세요 1", "이런 말은 피하세요 2"]
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
    console.error("[ai-competitor-response] error:", err);
    return Response.json(
      {
        error: "경쟁사 대응 전략 생성에 실패했습니다.",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
