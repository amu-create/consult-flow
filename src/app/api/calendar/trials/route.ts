import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const monthParam = searchParams.get("month"); // e.g. "2026-04"

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  if (monthParam) {
    const parts = monthParam.split("-");
    if (parts.length === 2) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // convert to 0-indexed
    }
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  const tasks = await prisma.followUpTask.findMany({
    where: {
      dueDate: {
        gte: startDate,
        lt: endDate,
      },
      OR: [
        { description: { contains: "체험" } },
        { taskType: "VISIT" },
      ],
    },
    orderBy: { dueDate: "asc" },
    include: {
      lead: {
        select: {
          studentName: true,
          grade: true,
          subject: true,
          parentPhone: true,
        },
      },
      assignee: {
        select: { name: true },
      },
    },
  });

  const events = tasks.map((task) => {
    const dueDate = new Date(task.dueDate);
    return {
      id: task.id,
      date: dueDate.toISOString(),
      time: dueDate.toISOString().split("T")[1]?.replace("Z", "") || "",
      studentName: task.lead.studentName,
      grade: task.lead.grade,
      subject: task.lead.subject,
      parentPhone: task.lead.parentPhone,
      assigneeName: task.assignee.name,
      status: task.status,
    };
  });

  return Response.json({ events });
}
