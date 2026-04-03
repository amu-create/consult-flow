import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // Find TRIAL_BOOKED leads with a trial-related task due tomorrow
  const leads = await prisma.lead.findMany({
    where: {
      status: "TRIAL_BOOKED",
    },
    include: {
      tasks: {
        where: {
          dueDate: {
            gte: tomorrowStart,
            lte: tomorrowEnd,
          },
          OR: [
            { taskType: { contains: "trial" } },
            { taskType: { contains: "체험" } },
            { taskType: { contains: "VISIT_REMIND" } },
            { description: { contains: "체험" } },
            { description: { contains: "trial" } },
          ],
        },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
    },
  });

  const reminders = leads
    .filter((lead) => lead.tasks.length > 0)
    .map((lead) => ({
      leadId: lead.id,
      studentName: lead.studentName,
      parentPhone: lead.parentPhone,
      trialDate: lead.tasks[0].dueDate.toISOString(),
      message: `안녕하세요, ${lead.studentName} 학부모님. 내일 체험 수업이 예정되어 있습니다. 시간에 맞춰 방문 부탁드립니다.`,
    }));

  return NextResponse.json({ reminders });
}
