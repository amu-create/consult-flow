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

  const headers = ["학생이름", "학년", "과목", "학부모이름", "연락처", "관계", "문의경로", "상태", "관심도", "담당자", "메모", "등록일"];
  const rows = leads.map((lead) => [
    lead.studentName,
    lead.grade,
    lead.subject,
    lead.parentName ?? "",
    lead.parentPhone,
    lead.parentRelation ?? "",
    INQUIRY_SOURCES[lead.inquirySource as keyof typeof INQUIRY_SOURCES] ?? lead.inquirySource,
    STATUS_LABELS[lead.status as LeadStatus] ?? lead.status,
    String(lead.interestScore),
    lead.assignedUser?.name ?? "",
    lead.memo ?? "",
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
