import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidTransition } from "@/lib/status-machine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  if (!isValidTransition(lead.status, "DROPPED")) {
    return Response.json(
      { error: `Cannot drop from ${lead.status}` },
      { status: 400 }
    );
  }

  if (!body.reasons || !Array.isArray(body.reasons) || body.reasons.length === 0) {
    return Response.json(
      { error: "이탈 사유는 최소 1개 필수입니다." },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction([
    prisma.lead.update({
      where: { id },
      data: { status: "DROPPED" },
    }),
    prisma.statusLog.create({
      data: {
        leadId: id,
        fromStatus: lead.status,
        toStatus: "DROPPED",
        changedBy: body.createdBy,
        reason: "이탈 처리",
      },
    }),
    prisma.dropOffReason.create({
      data: {
        leadId: id,
        reasons: JSON.stringify(body.reasons),
        detailMemo: body.detailMemo,
        canRetry: body.canRetry ?? false,
        createdBy: body.createdBy,
      },
    }),
  ]);

  return Response.json(result[0], { status: 201 });
}
