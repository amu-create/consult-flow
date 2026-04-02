import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const fromParam = request.nextUrl.searchParams.get("from");
  const toParam = request.nextUrl.searchParams.get("to");

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const from = fromParam ? new Date(fromParam) : sixMonthsAgo;
  const to = toParam ? new Date(toParam + "T23:59:59") : now;

  const [allLeads, statusLogs] = await Promise.all([
    prisma.lead.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true, status: true },
    }),
    prisma.statusLog.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        toStatus: { in: ["REGISTERED", "DROPPED"] },
      },
      select: { toStatus: true, createdAt: true },
    }),
  ]);

  const months: Array<{
    month: string;
    label: string;
    newInquiries: number;
    registered: number;
    dropped: number;
  }> = [];

  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  while (cursor <= to) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      month: key,
      label: `${cursor.getMonth() + 1}월`,
      newInquiries: 0,
      registered: 0,
      dropped: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const lead of allLeads) {
    const d = new Date(lead.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = months.find((m) => m.month === key);
    if (bucket) bucket.newInquiries++;
  }

  for (const log of statusLogs) {
    const d = new Date(log.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = months.find((m) => m.month === key);
    if (bucket) {
      if (log.toStatus === "REGISTERED") bucket.registered++;
      if (log.toStatus === "DROPPED") bucket.dropped++;
    }
  }

  return Response.json({ months });
}
