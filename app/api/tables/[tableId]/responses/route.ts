import { NextRequest, NextResponse } from "next/server";

import { notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ tableId: string }> };

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) return notFound("Table");

  const pageParam = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSizeParam = Number(
    request.nextUrl.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE,
  );

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize =
    Number.isFinite(pageSizeParam) && pageSizeParam > 0
      ? Math.min(pageSizeParam, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  const [responses, total] = await Promise.all([
    prisma.feedbackResponse.findMany({
      where: { tableId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.feedbackResponse.count({ where: { tableId } }),
  ]);

  return NextResponse.json({
    data: responses,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
