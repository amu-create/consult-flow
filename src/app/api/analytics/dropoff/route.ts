import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const REASON_LABELS: Record<string, string> = {
  PRICE: "가격",
  SCHEDULE: "시간대",
  COMPETITOR: "경쟁학원",
  DISTANCE: "거리",
  LOST_INTEREST: "관심상실",
  NO_RESPONSE: "연락두절",
  OTHER: "기타",
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dropOffs = await prisma.dropOffReason.findMany({
    where: { lead: { status: "DROPPED" } },
    select: { reasons: true },
  });

  const countMap: Record<string, number> = {};

  for (const d of dropOffs) {
    try {
      const reasons = JSON.parse(d.reasons) as string[];
      for (const r of reasons) {
        countMap[r] = (countMap[r] ?? 0) + 1;
      }
    } catch {
      // Skip malformed JSON
    }
  }

  const reasons = Object.entries(countMap)
    .map(([reason, count]) => ({
      reason,
      label: REASON_LABELS[reason] ?? reason,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return Response.json(reasons);
}
