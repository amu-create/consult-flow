import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidTransition } from "@/lib/status-machine";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { toStatus, changedBy, reason } = body;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  if (!isValidTransition(lead.status, toStatus)) {
    return Response.json(
      {
        error: `Cannot transition from ${lead.status} to ${toStatus}`,
      },
      { status: 400 }
    );
  }

  if (toStatus === "DROPPED") {
    return Response.json(
      { error: "Use drop-off endpoint for DROPPED status" },
      { status: 400 }
    );
  }

  const [updatedLead] = await prisma.$transaction([
    prisma.lead.update({
      where: { id },
      data: { status: toStatus },
    }),
    prisma.statusLog.create({
      data: {
        leadId: id,
        fromStatus: lead.status,
        toStatus,
        changedBy,
        reason,
      },
    }),
  ]);

  return Response.json(updatedLead);
}
