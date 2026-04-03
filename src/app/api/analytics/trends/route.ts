import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, status: true },
  });

  const buckets = new Map<string, { newLeads: number; registered: number; dropped: number }>();

  // Pre-populate 6 months
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { newLeads: 0, registered: 0, dropped: 0 });
  }

  for (const lead of leads) {
    const d = new Date(lead.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;

    bucket.newLeads++;
    if (lead.status === "REGISTERED") bucket.registered++;
    if (lead.status === "DROPPED") bucket.dropped++;
  }

  const months = Array.from(buckets.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));

  return Response.json(months);
}
