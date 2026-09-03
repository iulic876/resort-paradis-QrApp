import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ hallId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { hallId } = await params;

  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!hall) return notFound("Hall");

  const search = request.nextUrl.searchParams.get("search")?.trim();

  const tables = await prisma.table.findMany({
    where: {
      hallId,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { number: "asc" },
    include: {
      qr: { select: { isActive: true, scanCount: true, lastScannedAt: true } },
      _count: { select: { responses: true } },
    },
  });

  const data = tables.map((table) => ({
    id: table.id,
    hallId: table.hallId,
    name: table.name,
    number: table.number,
    status: table.status,
    isActive: table.isActive,
    qrStatus: table.qr?.isActive ? "activ" : "lipsa",
    scans: table.qr?.scanCount ?? 0,
    responses: table._count.responses,
    lastScan: table.qr?.lastScannedAt ?? null,
  }));

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { hallId } = await params;

  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!hall) return notFound("Hall");

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return badRequest("name is required");

  const maxNumber = await prisma.table.aggregate({
    where: { hallId },
    _max: { number: true },
  });
  const number = (maxNumber._max.number ?? 0) + 1;

  const table = await prisma.table.create({
    data: { hallId, name, number, status: "NEW" },
  });

  return NextResponse.json({ data: table }, { status: 201 });
}
