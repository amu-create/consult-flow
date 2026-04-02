import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DROP_OFF_REASONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const dateFilter: Record<string, unknown> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to + "T23:59:59");
  const hasDate = Object.keys(dateFilter).length > 0;

  const dropOffs = await prisma.dropOffReason.findMany({
    ...(hasDate ? { where: { createdAt: dateFilter } } : {}),
    select: { reasons: true },
  });

  const countMap: Record<string, number> = {};
  for (const d of dropOffs) {
    const reasons = JSON.parse(d.reasons) as string[];
    for (const r of reasons) {
      countMap[r] = (countMap[r] ?? 0) + 1;
    }
  }

  const reasons = Object.entries(countMap)
    .map(([code, count]) => ({
      code,
      label: DROP_OFF_REASONS[code as keyof typeof DROP_OFF_REASONS] ?? code,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return Response.json({ reasons, totalDropped: dropOffs.length });
}
