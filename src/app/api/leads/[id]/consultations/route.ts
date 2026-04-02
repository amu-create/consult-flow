import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { recalculateScore } from "@/lib/interest-calculator";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const consultations = await prisma.consultation.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { id: true, name: true } },
      task: true,
    },
  });

  return Response.json(consultations);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.followUp) {
    return Response.json(
      { error: "다음 액션(followUp)은 필수입니다." },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  const signals: string[] = body.interestSignals
    ? JSON.parse(
        typeof body.interestSignals === "string"
          ? body.interestSignals
          : JSON.stringify(body.interestSignals)
      )
    : [];

  const newScore = recalculateScore(lead.interestScore, signals);

  const result = await prisma.$transaction(async (tx) => {
    const consultation = await tx.consultation.create({
      data: {
        leadId: id,
        channel: body.channel,
        content: body.content,
        interestSignals: JSON.stringify(signals),
        createdBy: body.createdBy,
      },
    });

    const task = await tx.followUpTask.create({
      data: {
        leadId: id,
        consultationId: consultation.id,
        assignedTo: body.followUp.assignedTo,
        taskType: body.followUp.taskType || "CALL",
        description: body.followUp.description,
        dueDate: new Date(body.followUp.dueDate),
        priority: body.followUp.priority || "NORMAL",
      },
    });

    await tx.lead.update({
      where: { id },
      data: { interestScore: newScore },
    });

    return { consultation, task };
  });

  return Response.json(result, { status: 201 });
}
