import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filter = searchParams.get("filter"); // today | overdue | all

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  let where: Record<string, unknown> = {};

  if (filter === "today") {
    where = {
      status: "PENDING",
      dueDate: { gte: todayStart, lt: todayEnd },
    };
  } else if (filter === "overdue") {
    where = {
      status: "PENDING",
      dueDate: { lt: todayStart },
    };
  } else {
    where = { status: "PENDING" };
  }

  const tasks = await prisma.followUpTask.findMany({
    where,
    orderBy: { dueDate: "asc" },
    include: {
      lead: { select: { id: true, studentName: true, status: true } },
      assignee: { select: { id: true, name: true } },
    },
  });

  return Response.json(tasks);
}
