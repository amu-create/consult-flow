import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const leads = await prisma.lead.findMany({
    where: {
      status: {
        in: ["CONSULTING", "TRIAL_DONE"],
      },
      createdAt: {
        lte: fourteenDaysAgo,
      },
    },
    select: {
      id: true,
      studentName: true,
      createdAt: true,
    },
  });

  const now = new Date();

  const alerts = leads.map((lead) => {
    const daysSinceCreated = Math.floor(
      (now.getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      leadId: lead.id,
      studentName: lead.studentName,
      alertType: "FOLLOW_UP_NEEDED" as const,
      message: `${lead.studentName} 학생이 ${daysSinceCreated}일 전에 등록되었으나 아직 진행 중입니다. 관심이 줄어들 수 있으니 후속 조치가 필요합니다.`,
      daysSinceCreated,
    };
  });

  alerts.sort((a, b) => b.daysSinceCreated - a.daysSinceCreated);

  return NextResponse.json({ alerts });
}
