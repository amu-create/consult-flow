import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { INQUIRY_SOURCES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const dateFilter: Record<string, unknown> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to + "T23:59:59");
  const hasDate = Object.keys(dateFilter).length > 0;

  const where = hasDate ? { createdAt: dateFilter } : {};

  const [totalBySource, registeredBySource] = await Promise.all([
    prisma.lead.groupBy({
      by: ["inquirySource"],
      where,
      _count: { inquirySource: true },
    }),
    prisma.lead.groupBy({
      by: ["inquirySource"],
      where: { ...where, status: "REGISTERED" },
      _count: { inquirySource: true },
    }),
  ]);

  const regMap: Record<string, number> = {};
  for (const r of registeredBySource) {
    regMap[r.inquirySource] = r._count.inquirySource;
  }

  const sources = totalBySource.map((s) => {
    const total = s._count.inquirySource;
    const registered = regMap[s.inquirySource] ?? 0;
    return {
      source: s.inquirySource,
      label: INQUIRY_SOURCES[s.inquirySource as keyof typeof INQUIRY_SOURCES] ?? s.inquirySource,
      total,
      registered,
      conversionRate: total > 0 ? Math.round((registered / total) * 100) : 0,
    };
  });

  sources.sort((a, b) => b.total - a.total);
  return Response.json({ sources });
}
