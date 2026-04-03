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

    const { leadId } = await request.json();

    if (!leadId) {
      return Response.json(
        { error: "leadId는 필수입니다." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        consultations: { orderBy: { createdAt: "desc" } },
        tasks: true,
        statusLogs: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!lead) {
      return Response.json({ error: "리드를 찾을 수 없습니다." }, { status: 404 });
    }

    // Calculate metrics
    const now = new Date();
    const lastConsultation = lead.consultations[0];
    const daysSinceLastConsultation = lastConsultation
      ? Math.floor(
          (now.getTime() - new Date(lastConsultation.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : -1;

    const totalConsultations = lead.consultations.length;

    const totalTasks = lead.tasks.length;
    const completedTasks = lead.tasks.filter(
      (t) => t.status === "COMPLETED"
    ).length;
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statusChanges = lead.statusLogs.length;

    const consultationSummary = lead.consultations
      .slice(0, 5)
      .map(
        (c, i) =>
          `${i + 1}. [${c.channel}] ${c.content} (${new Date(c.createdAt).toLocaleDateString("ko-KR")})`
      )
      .join("\n");

    const statusHistory = lead.statusLogs
      .slice(0, 10)
      .map(
        (s) =>
          `${s.fromStatus || "없음"} → ${s.toStatus} (${new Date(s.createdAt).toLocaleDateString("ko-KR")})`
      )
      .join("\n");

    const prompt = `당신은 학원 CRM 이탈 예측 전문가입니다. 다음 리드 데이터를 분석하여 이탈(churn) 위험도를 예측해주세요.

리드 정보:
- 학생: ${lead.studentName} (${lead.grade}, ${lead.subject})
- 현재 상태: ${lead.status}
- 관심도 점수: ${lead.interestScore ?? "미정"}/10
- 경쟁사 정보: ${lead.competitorInfo || "없음"}
- 메모: ${lead.memo || "없음"}

주요 지표:
- 마지막 상담 이후 경과일: ${daysSinceLastConsultation === -1 ? "상담 이력 없음" : `${daysSinceLastConsultation}일`}
- 총 상담 횟수: ${totalConsultations}회
- 태스크 완료율: ${taskCompletionRate}% (${completedTasks}/${totalTasks})
- 상태 변경 횟수: ${statusChanges}회

최근 상담 이력:
${consultationSummary || "없음"}

상태 변경 이력:
${statusHistory || "없음"}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "riskLevel": "HIGH" 또는 "MEDIUM" 또는 "LOW",
  "riskScore": 0~100 사이 정수,
  "reasons": ["이탈 위험 원인 1", "이탈 위험 원인 2", "이탈 위험 원인 3"],
  "preventionActions": ["이탈 방지 액션 1", "이탈 방지 액션 2", "이탈 방지 액션 3"]
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

    return Response.json({
      success: true,
      leadId: lead.id,
      metrics: {
        daysSinceLastConsultation,
        totalConsultations,
        taskCompletionRate,
        statusChanges,
      },
      ...result,
    });
  } catch (err) {
    console.error("[ai-churn-prediction] error:", err);
    return Response.json(
      {
        error: "이탈 예측 분석에 실패했습니다.",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
