import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registeredLeads = await prisma.lead.findMany({
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
  });

  const days: number[] = [];

  for (const lead of registeredLeads) {
    const registeredAt = lead.statusLogs[0]?.createdAt;
    if (!registeredAt) continue;

    const diff =
      (new Date(registeredAt).getTime() - new Date(lead.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    days.push(Math.round(diff * 10) / 10);
  }

  if (days.length === 0) {
    return Response.json({
      averageDays: 0,
      fastest: 0,
      slowest: 0,
      count: 0,
    });
  }

  days.sort((a, b) => a - b);

  const averageDays =
    Math.round((days.reduce((sum, d) => sum + d, 0) / days.length) * 10) / 10;

  return Response.json({
    averageDays,
    fastest: days[0],
    slowest: days[days.length - 1],
    count: days.length,
  });
}
