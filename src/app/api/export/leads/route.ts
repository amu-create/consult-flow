import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, INQUIRY_SOURCES, type LeadStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await prisma.lead.findMany({
    include: {
      assignedUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["학생명", "학년", "과목", "상태", "관심도", "담당자", "학부모명", "연락처", "문의경로", "등록일"];
  const rows = leads.map((lead) => [
    lead.studentName,
    lead.grade,
    lead.subject,
    STATUS_LABELS[lead.status as LeadStatus] ?? lead.status,
    String(lead.interestScore),
    lead.assignedUser?.name ?? "",
    lead.parentName ?? "",
    lead.parentPhone,
    INQUIRY_SOURCES[lead.inquirySource as keyof typeof INQUIRY_SOURCES] ?? lead.inquirySource,
    new Date(lead.createdAt).toLocaleDateString("ko-KR"),
  ]);

  const csv = "\uFEFF" + [headers, ...rows].map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads_${date}.csv"`,
    },
  });
}
