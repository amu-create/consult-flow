import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { askGemini, buildSummaryPrompt } from "@/lib/gemini";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { consultationId } = await request.json();

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });
  if (!consultation) {
    return Response.json({ error: "Consultation not found" }, { status: 404 });
  }

  const signals: string[] = consultation.interestSignals
    ? JSON.parse(consultation.interestSignals)
    : [];

  const prompt = buildSummaryPrompt({
    channel: consultation.channel,
    content: consultation.content,
    interestSignals: signals,
    studentName: lead.studentName,
    grade: lead.grade,
    subject: lead.subject,
  });

  try {
    const raw = await askGemini(prompt);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    return Response.json({ success: true, ...result });
  } catch (err) {
    console.error("[ai-summary] error:", err);
    return Response.json(
      { error: "AI 분석에 실패했습니다.", detail: String(err) },
      { status: 500 }
    );
  }
}
