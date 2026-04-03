import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FUNNEL_ORDER = [
  { status: "NEW_INQUIRY", label: "신규문의" },
  { status: "CONSULTING", label: "상담중" },
  { status: "TRIAL_BOOKED", label: "체험예약" },
  { status: "TRIAL_DONE", label: "체험완료" },
  { status: "REGISTERED", label: "등록완료" },
  { status: "DROPPED", label: "이탈" },
] as const;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const counts = await prisma.lead.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const countMap: Record<string, number> = {};
  for (const c of counts) {
    countMap[c.status] = c._count.status;
  }

  const stages = FUNNEL_ORDER.map(({ status, label }) => ({
    status,
    label,
    count: countMap[status] ?? 0,
  }));

  return Response.json(stages);
}
