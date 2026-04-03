import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { askGemini, buildInterestAnalysisPrompt } from "@/lib/gemini";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  const consultations = await prisma.consultation.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (consultations.length === 0) {
    return Response.json(
      { error: "상담 기록이 없어 분석할 수 없습니다." },
      { status: 400 }
    );
  }

  const prompt = buildInterestAnalysisPrompt({
    content: consultations[0].content,
    allConsultations: consultations.map((c) => ({
      content: c.content,
      channel: c.channel,
      createdAt: c.createdAt.toISOString(),
    })),
    studentName: lead.studentName,
    grade: lead.grade,
    currentScore: lead.interestScore,
  });

  try {
    const raw = await askGemini(prompt);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);

    // Update lead's interest score with AI score
    if (result.aiScore && typeof result.aiScore === "number") {
      await prisma.lead.update({
        where: { id },
        data: { interestScore: result.aiScore },
      });
    }

    return Response.json({ success: true, ...result });
  } catch (err) {
    console.error("[ai-analysis] error:", err);
    return Response.json(
      { error: "AI 분석에 실패했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
