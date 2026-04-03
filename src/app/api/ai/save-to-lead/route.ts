import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Save AI analysis result as a consultation to an existing lead
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leadId, summary, transcript, interestScore, analysis } =
      await request.json();

    if (!leadId) {
      return Response.json(
        { error: "리드 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return Response.json({ error: "리드를 찾을 수 없습니다." }, { status: 404 });
    }

    // Build consultation content from AI analysis
    const content = [
      `[AI 분석 결과]`,
      ``,
      `요약: ${summary}`,
      transcript ? `\n대화 내용:\n${transcript}` : "",
      analysis ? `\n상세 분석:\n${analysis}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Create consultation + follow-up task in transaction
    const result = await prisma.$transaction(async (tx) => {
      const consultation = await tx.consultation.create({
        data: {
          leadId,
          channel: "PHONE",
          content,
          interestSignals: JSON.stringify([]),
          createdBy: session.id,
        },
      });

      // Auto-create a follow-up task
      const task = await tx.followUpTask.create({
        data: {
          leadId,
          consultationId: consultation.id,
          assignedTo: session.id,
          taskType: "CALL",
          description: "AI 분석 기반 후속 상담 진행",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
          priority: "NORMAL",
        },
      });

      // Update interest score if provided
      if (interestScore && interestScore > 0) {
        await tx.lead.update({
          where: { id: leadId },
          data: { interestScore },
        });
      }

      return { consultation, task };
    });

    return Response.json({ success: true, ...result }, { status: 201 });
  } catch (err) {
    console.error("[save-to-lead] error:", err);
    return Response.json(
      { error: "저장에 실패했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
