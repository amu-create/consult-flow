import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedUser: { select: { id: true, name: true } },
      consultations: {
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { id: true, name: true } },
          task: true,
        },
      },
      tasks: {
        orderBy: { dueDate: "asc" },
        include: {
          assignee: { select: { id: true, name: true } },
        },
      },
      statusLogs: {
        orderBy: { createdAt: "desc" },
        include: {
          changer: { select: { id: true, name: true } },
        },
      },
      dropOffReason: true,
    },
  });

  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  return Response.json(lead);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      studentName: body.studentName,
      grade: body.grade,
      subject: body.subject,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      parentRelation: body.parentRelation,
      inquirySource: body.inquirySource,
      assignedTo: body.assignedTo,
      competitorInfo: body.competitorInfo,
      currentLevel: body.currentLevel,
      memo: body.memo,
      interestScore: body.interestScore,
    },
  });

  return Response.json(lead);
}
