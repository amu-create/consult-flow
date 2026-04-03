import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { studentName, grade, subject, parentName, parentPhone, preferredDays, inquiry } =
    body as {
      studentName?: string;
      grade?: string;
      subject?: string;
      parentName?: string;
      parentPhone?: string;
      preferredDays?: string[];
      inquiry?: string;
    };

  // Validate required fields
  if (!studentName || !grade || !subject || !parentName || !parentPhone) {
    return Response.json(
      { error: "필수 항목을 모두 입력해 주세요." },
      { status: 400 }
    );
  }

  // Rate limit: check duplicate parentPhone
  const existing = await prisma.lead.findFirst({
    where: { parentPhone, inquirySource: "ONLINE" },
  });

  if (existing) {
    return Response.json(
      { error: "이미 신청하셨습니다." },
      { status: 409 }
    );
  }

  // Build memo from preferred days and inquiry
  const memoParts: string[] = [];
  if (Array.isArray(preferredDays) && preferredDays.length > 0) {
    memoParts.push(`희망 요일: ${preferredDays.join(", ")}`);
  }
  if (inquiry && typeof inquiry === "string" && inquiry.trim()) {
    memoParts.push(`문의 사항: ${inquiry.trim()}`);
  }

  await prisma.lead.create({
    data: {
      studentName: studentName.trim(),
      grade,
      subject,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      inquirySource: "ONLINE",
      status: "NEW_INQUIRY",
      memo: memoParts.length > 0 ? memoParts.join("\n") : null,
    },
  });

  return Response.json({ success: true });
}
