import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { askGemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

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

    const { leadId, channel } = await request.json();

    if (!leadId || !channel) {
      return Response.json(
        { error: "leadId와 channel은 필수입니다." },
        { status: 400 }
      );
    }

    if (!["KAKAO", "SMS"].includes(channel)) {
      return Response.json(
        { error: "channel은 KAKAO 또는 SMS여야 합니다." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        consultations: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    if (!lead) {
      return Response.json({ error: "리드를 찾을 수 없습니다." }, { status: 404 });
    }

    const consultationHistory = lead.consultations
      .map(
        (c, i) =>
          `${i + 1}. [${c.channel}] ${c.content} (${new Date(c.createdAt).toLocaleDateString("ko-KR")})`
      )
      .join("\n");

    const channelGuide =
      channel === "KAKAO"
        ? "카카오톡 메시지이므로 친근하고 따뜻한 톤으로 작성해주세요. 이모티콘 사용은 자제하되 부드러운 말투를 사용하세요."
        : "문자 메시지이므로 간결하고 핵심적으로 작성해주세요. 2-3문장 이내로 작성하세요.";

    const prompt = `당신은 학원 상담 전문가입니다. 학부모에게 보낼 후속 메시지를 작성해주세요.

학생 정보:
- 이름: ${lead.studentName}
- 학년: ${lead.grade}
- 과목: ${lead.subject}
- 학부모 성함: ${lead.parentName}

최근 상담 이력:
${consultationHistory || "상담 이력 없음"}

채널: ${channel === "KAKAO" ? "카카오톡" : "문자(SMS)"}
${channelGuide}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "message": "학부모에게 보낼 후속 메시지 전문",
  "tone": "메시지의 톤 설명 (예: 따뜻하고 관심을 표현하는 톤)"
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
    console.error("[ai-follow-up-message] error:", err);
    return Response.json(
      {
        error: "후속 메시지 생성에 실패했습니다.",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
