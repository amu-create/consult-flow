import { prisma } from "@/lib/prisma";
import { CHANNELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const consultations = await prisma.consultation.findMany({
    include: {
      lead: { select: { studentName: true } },
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["학생이름", "상담채널", "상담내용", "관심신호", "담당자", "상담일시"];
  const rows = consultations.map((c) => [
    c.lead.studentName,
    CHANNELS[c.channel as keyof typeof CHANNELS] ?? c.channel,
    c.content,
    c.interestSignals
      ? (JSON.parse(c.interestSignals) as string[]).join(", ")
      : "",
    c.creator.name,
    new Date(c.createdAt).toLocaleString("ko-KR"),
  ]);

  const csv = "\uFEFF" + [headers, ...rows].map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="consultations_${date}.csv"`,
    },
  });
}
