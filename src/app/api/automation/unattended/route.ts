import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Find leads not in REGISTERED or DROPPED status
  const leads = await prisma.lead.findMany({
    where: {
      status: {
        notIn: ["REGISTERED", "DROPPED"],
      },
    },
    include: {
      consultations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const now = new Date();

  const alerts = leads
    .map((lead) => {
      const lastContact = lead.consultations[0]?.createdAt ?? null;
      const referenceDate = lastContact ?? lead.createdAt;
      const daysSinceContact = Math.floor(
        (now.getTime() - new Date(referenceDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        leadId: lead.id,
        studentName: lead.studentName,
        status: lead.status,
        daysSinceContact,
        assignedTo: lead.assignedTo,
      };
    })
    .filter((alert) => alert.daysSinceContact >= 3)
    .sort((a, b) => b.daysSinceContact - a.daysSinceContact);

  return NextResponse.json({ alerts });
}
