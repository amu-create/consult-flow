import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    where: { assignedTo: { not: null } },
    select: {
      assignedTo: true,
      status: true,
      interestScore: true,
      assignedUser: { select: { id: true, name: true } },
    },
  });

  const staffMap = new Map<
    string,
    {
      userId: string;
      name: string;
      totalLeads: number;
      registered: number;
      dropped: number;
      scoreSum: number;
    }
  >();

  for (const lead of leads) {
    if (!lead.assignedTo || !lead.assignedUser) continue;

    let entry = staffMap.get(lead.assignedTo);
    if (!entry) {
      entry = {
        userId: lead.assignedUser.id,
        name: lead.assignedUser.name,
        totalLeads: 0,
        registered: 0,
        dropped: 0,
        scoreSum: 0,
      };
      staffMap.set(lead.assignedTo, entry);
    }

    entry.totalLeads++;
    entry.scoreSum += lead.interestScore;
    if (lead.status === "REGISTERED") entry.registered++;
    if (lead.status === "DROPPED") entry.dropped++;
  }

  const staff = Array.from(staffMap.values()).map((s) => ({
    userId: s.userId,
    name: s.name,
    totalLeads: s.totalLeads,
    registered: s.registered,
    dropped: s.dropped,
    conversionRate:
      s.totalLeads > 0
        ? Math.round((s.registered / s.totalLeads) * 1000) / 10
        : 0,
    avgScore:
      s.totalLeads > 0
        ? Math.round((s.scoreSum / s.totalLeads) * 10) / 10
        : 0,
  }));

  staff.sort((a, b) => b.totalLeads - a.totalLeads);

  return Response.json(staff);
}
