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

  const leadWhere = hasDate ? { createdAt: dateFilter } : {};
  const taskWhere = hasDate
    ? { status: "COMPLETED" as const, completedAt: dateFilter }
    : { status: "COMPLETED" as const };
  const consultWhere = hasDate ? { createdAt: dateFilter } : {};

  const [users, leadsByUser, tasksByUser, consultsByUser] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true },
    }),
    prisma.lead.groupBy({ by: ["assignedTo"], where: leadWhere, _count: { assignedTo: true } }),
    prisma.followUpTask.groupBy({ by: ["assignedTo"], where: taskWhere, _count: { assignedTo: true } }),
    prisma.consultation.groupBy({ by: ["createdBy"], where: consultWhere, _count: { createdBy: true } }),
  ]);

  const leadsMap: Record<string, number> = {};
  for (const l of leadsByUser) {
    if (l.assignedTo) leadsMap[l.assignedTo] = l._count.assignedTo;
  }
  const tasksMap: Record<string, number> = {};
  for (const t of tasksByUser) {
    tasksMap[t.assignedTo] = t._count.assignedTo;
  }
  const consultsMap: Record<string, number> = {};
  for (const c of consultsByUser) {
    consultsMap[c.createdBy] = c._count.createdBy;
  }

  const staff = users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    leadsManaged: leadsMap[u.id] ?? 0,
    tasksCompleted: tasksMap[u.id] ?? 0,
    consultationsDone: consultsMap[u.id] ?? 0,
  }));

  return Response.json({ staff });
}
