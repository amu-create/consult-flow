import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const leads = await prisma.lead.findMany({
    where: {
      status: "REGISTERED",
      updatedAt: { lte: sixtyDaysAgo },
    },
    include: {
      assignedUser: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  const now = new Date();
  const result = leads.map((lead) => {
    const daysSinceRegistration = Math.floor(
      (now.getTime() - lead.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: lead.id,
      studentName: lead.studentName,
      grade: lead.grade,
      subject: lead.subject,
      parentPhone: lead.parentPhone,
      registeredDate: lead.updatedAt.toISOString(),
      daysSinceRegistration,
      assignedUser: lead.assignedUser
        ? { id: lead.assignedUser.id, name: lead.assignedUser.name }
        : null,
    };
  });

  return NextResponse.json({ leads: result });
}
