import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { TableStatus } from "@/lib/generated/prisma/enums";

type RouteParams = { params: Promise<{ tableId: string }> };

const VALID_STATUSES = new Set(Object.values(TableStatus));

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      qr: true,
      hall: { select: { id: true, name: true } },
      _count: { select: { responses: true } },
    },
  });

  if (!table) return notFound("Table");

  return NextResponse.json({
    data: {
      id: table.id,
      hallId: table.hallId,
      hallName: table.hall.name,
      name: table.name,
      number: table.number,
      status: table.status,
      isActive: table.isActive,
      templateId: table.templateId,
      qrStatus: table.qr?.isActive ? "activ" : "lipsa",
      scans: table.qr?.scanCount ?? 0,
      lastScan: table.qr?.lastScannedAt ?? null,
      responses: table._count.responses,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { tableId } = await params;

  const existing = await prisma.table.findUnique({ where: { id: tableId } });
  if (!existing) return notFound("Table");

  const body = await request.json().catch(() => null);
  const data: {
    name?: string;
    status?: TableStatus;
    isActive?: boolean;
    templateId?: string | null;
  } = {};

  if (body?.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return badRequest("name cannot be empty");
    data.name = name;
  }

  if (body?.status !== undefined) {
    if (
      typeof body.status !== "string" ||
      !VALID_STATUSES.has(body.status as TableStatus)
    ) {
      return badRequest(
        `status must be one of: ${[...VALID_STATUSES].join(", ")}`,
      );
    }
    data.status = body.status as TableStatus;
  }

  if (body?.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return badRequest("isActive must be a boolean");
    }
    data.isActive = body.isActive;
  }

  if (body?.templateId !== undefined) {
    if (body.templateId !== null && typeof body.templateId !== "string") {
      return badRequest("templateId must be a string or null");
    }
    data.templateId = body.templateId;
  }

  const table = await prisma.table.update({ where: { id: tableId }, data });

  return NextResponse.json({ data: table });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { tableId } = await params;

  const existing = await prisma.table.findUnique({ where: { id: tableId } });
  if (!existing) return notFound("Table");

  await prisma.table.delete({ where: { id: tableId } });

  return new NextResponse(null, { status: 204 });
}
