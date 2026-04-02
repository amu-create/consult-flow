import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.status === "COMPLETED") {
    data.status = "COMPLETED";
    data.completedAt = new Date();
  } else if (body.status === "CANCELLED") {
    data.status = "CANCELLED";
  } else if (body.status) {
    data.status = body.status;
  }

  if (body.description) data.description = body.description;
  if (body.dueDate) data.dueDate = new Date(body.dueDate);
  if (body.priority) data.priority = body.priority;

  const task = await prisma.followUpTask.update({
    where: { id },
    data,
  });

  return Response.json(task);
}
