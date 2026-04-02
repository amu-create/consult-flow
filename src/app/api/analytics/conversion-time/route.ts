import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const dateFilter: Record<string, unknown> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to + "T23:59:59");
  const hasDate = Object.keys(dateFilter).length > 0;

  const where: Record<string, unknown> = { status: "REGISTERED" };
  if (hasDate) where.createdAt = dateFilter;

  const registeredLeads = await prisma.lead.findMany({
    where,
    select: {
      id: true,
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
    if (registeredAt) {
      const diff =
        (new Date(registeredAt).getTime() - new Date(lead.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      days.push(Math.round(diff));
    }
  }

  if (days.length === 0) {
    return Response.json({ averageDays: 0, medianDays: 0, fastest: 0, slowest: 0, count: 0 });
  }

  days.sort((a, b) => a - b);
  const avg = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
  const median = days[Math.floor(days.length / 2)];

  return Response.json({
    averageDays: avg,
    medianDays: median,
    fastest: days[0],
    slowest: days[days.length - 1],
    count: days.length,
  });
}
