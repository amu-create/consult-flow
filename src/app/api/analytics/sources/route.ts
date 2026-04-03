import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  KAKAO: "카카오",
  PHONE: "전화",
  VISIT: "방문",
  REFERRAL: "소개",
  ONLINE: "온라인",
  FLYER: "전단지",
  OTHER: "기타",
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalBySource, registeredBySource] = await Promise.all([
    prisma.lead.groupBy({
      by: ["inquirySource"],
      _count: { inquirySource: true },
    }),
    prisma.lead.groupBy({
      by: ["inquirySource"],
      where: { status: "REGISTERED" },
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
      label: SOURCE_LABELS[s.inquirySource] ?? s.inquirySource,
      total,
      registered,
      conversionRate: total > 0 ? Math.round((registered / total) * 1000) / 10 : 0,
    };
  });

  sources.sort((a, b) => b.total - a.total);

  return Response.json(sources);
}
