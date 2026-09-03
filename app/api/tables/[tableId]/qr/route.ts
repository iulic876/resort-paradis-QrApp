import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ tableId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { qr: true },
  });

  if (!table) return notFound("Table");
  if (!table.qr) return notFound("QrCode");

  return NextResponse.json({ data: table.qr });
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) return notFound("Table");

  const token = randomUUID();

  const qr = await prisma.qrCode.upsert({
    where: { tableId },
    update: { token, isActive: true },
    create: { tableId, token },
  });

  return NextResponse.json({ data: qr }, { status: 201 });
}
