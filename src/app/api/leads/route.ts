import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "updatedAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { studentName: { contains: search } },
      { parentPhone: { contains: search } },
      { parentName: { contains: search } },
    ];
  }

  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  if (pageParam && pageSizeParam) {
    const page = Math.max(1, parseInt(pageParam) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(pageSizeParam) || 20));

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedUser: { select: { id: true, name: true } },
          tasks: { where: { status: "PENDING" }, orderBy: { dueDate: "asc" }, take: 1 },
          consultations: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    return Response.json({
      leads,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      assignedUser: { select: { id: true, name: true } },
      tasks: {
        where: { status: "PENDING" },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
      consultations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { [sort]: order },
  });

  return Response.json(leads);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const lead = await prisma.lead.create({
    data: {
      studentName: body.studentName,
      grade: body.grade,
      subject: body.subject,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      parentRelation: body.parentRelation || "어머니",
      inquirySource: body.inquirySource,
      status: "NEW_INQUIRY",
      interestScore: 0,
      assignedTo: body.assignedTo,
      competitorInfo: body.competitorInfo,
      currentLevel: body.currentLevel,
      memo: body.memo,
    },
    include: {
      assignedUser: { select: { id: true, name: true } },
    },
  });

  return Response.json(lead, { status: 201 });
}
