import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tasks = await prisma.followUpTask.findMany({
    where: { leadId: id },
    orderBy: { dueDate: "asc" },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  });

  return Response.json(tasks);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const task = await prisma.followUpTask.create({
    data: {
      leadId: id,
      assignedTo: body.assignedTo,
      taskType: body.taskType || "CALL",
      description: body.description,
      dueDate: new Date(body.dueDate),
      priority: body.priority || "NORMAL",
    },
  });

  return Response.json(task, { status: 201 });
}
