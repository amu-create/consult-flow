import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const FUNNEL_STAGES = [
  "NEW_INQUIRY",
  "INITIAL_CONSULT",
  "IN_PROGRESS",
  "TRIAL_BOOKED",
  "TRIAL_DONE",
  "REGISTERED",
] as const;

const STAGE_LABELS: Record<string, string> = {
  NEW_INQUIRY: "신규문의",
  INITIAL_CONSULT: "초기상담",
  IN_PROGRESS: "상담진행",
  TRIAL_BOOKED: "체험예약",
  TRIAL_DONE: "체험완료",
  REGISTERED: "등록완료",
};

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const dateFilter: Record<string, unknown> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to + "T23:59:59");
  const hasDate = Object.keys(dateFilter).length > 0;

  const [statusCounts, statusLogs] = await Promise.all([
    prisma.lead.groupBy({
      by: ["status"],
      ...(hasDate ? { where: { createdAt: dateFilter } } : {}),
      _count: { status: true },
    }),
    prisma.statusLog.groupBy({
      by: ["toStatus"],
      ...(hasDate ? { where: { createdAt: dateFilter } } : {}),
      _count: { toStatus: true },
    }),
  ]);

  const currentMap: Record<string, number> = {};
  for (const s of statusCounts) {
    currentMap[s.status] = s._count.status;
  }

  const reachedMap: Record<string, number> = {};
  for (const s of statusLogs) {
    reachedMap[s.toStatus] = s._count.toStatus;
  }

  const totalLeads = Object.values(currentMap).reduce((a, b) => a + b, 0);

  const stages = FUNNEL_STAGES.map((status) => {
    const current = currentMap[status] ?? 0;
    const transitioned = reachedMap[status] ?? 0;
    const totalReached =
      status === "NEW_INQUIRY" ? totalLeads : current + transitioned;

    return {
      status,
      label: STAGE_LABELS[status],
      currentCount: current,
      totalReached: Math.max(totalReached, current),
    };
  });

  return Response.json({ stages });
}
