import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const neglectedCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [
    totalLeads,
    newThisMonth,
    registeredThisMonth,
    droppedThisMonth,
    todayTasks,
    overdueTasks,
    neglectedLeads,
    hotLeads,
    statusCounts,
    registeredLeads,
    weeklyConsultations,
    weeklyTasksCompleted,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.lead.count({
      where: { status: "REGISTERED", updatedAt: { gte: monthStart } },
    }),
    prisma.lead.count({
      where: { status: "DROPPED", updatedAt: { gte: monthStart } },
    }),
    prisma.followUpTask.findMany({
      where: {
        status: "PENDING",
        dueDate: { gte: todayStart, lt: todayEnd },
      },
      include: {
        lead: { select: { id: true, studentName: true, status: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.followUpTask.findMany({
      where: {
        status: "PENDING",
        dueDate: { lt: todayStart },
      },
      include: {
        lead: { select: { id: true, studentName: true, status: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.lead.findMany({
      where: {
        status: {
          notIn: ["REGISTERED", "DROPPED"],
        },
        updatedAt: { lt: neglectedCutoff },
      },
      include: {
        assignedUser: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "asc" },
      take: 10,
    }),
    prisma.lead.findMany({
      where: {
        interestScore: { gte: 6 },
        status: { notIn: ["REGISTERED", "DROPPED"] },
      },
      include: {
        assignedUser: { select: { id: true, name: true } },
      },
      orderBy: { interestScore: "desc" },
      take: 10,
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.lead.findMany({
      where: { status: "REGISTERED" },
      select: {
        createdAt: true,
        statusLogs: {
          where: { toStatus: "REGISTERED" },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    }),
    prisma.consultation.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.followUpTask.count({
      where: { status: "COMPLETED", completedAt: { gte: weekStart } },
    }),
  ]);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [weeklyActivity, recentLeads] = await Promise.all([
    prisma.consultation.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.lead.findMany({
      select: { id: true, studentName: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const conversionRate =
    newThisMonth > 0
      ? Math.round((registeredThisMonth / newThisMonth) * 100)
      : 0;

  // Calculate average conversion days
  const conversionDays: number[] = [];
  for (const lead of registeredLeads) {
    const regLog = lead.statusLogs[0];
    if (regLog) {
      const diff =
        (new Date(regLog.createdAt).getTime() - new Date(lead.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      conversionDays.push(Math.round(diff));
    }
  }
  const avgConversionDays =
    conversionDays.length > 0
      ? Math.round(conversionDays.reduce((a, b) => a + b, 0) / conversionDays.length)
      : 0;

  return Response.json({
    summary: {
      totalLeads,
      newThisMonth,
      registeredThisMonth,
      droppedThisMonth,
      conversionRate,
      avgConversionDays,
      weeklyConsultations,
      weeklyTasksCompleted,
      weeklyActivity,
    },
    todayTasks,
    overdueTasks,
    neglectedLeads,
    hotLeads,
    recentLeads,
    statusCounts: statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    ),
  });
}
