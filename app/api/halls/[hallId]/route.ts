import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

type RouteParams = { params: Promise<{ hallId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { hallId } = await params;

  const hall = await prisma.hall.findUnique({
    where: { id: hallId },
    include: {
      _count: { select: { tables: true } },
      tables: { select: { _count: { select: { responses: true } } } },
    },
  });

  if (!hall) return notFound("Hall");

  return NextResponse.json({
    data: {
      id: hall.id,
      name: hall.name,
      slug: hall.slug,
      shortLabel: hall.shortLabel,
      sortOrder: hall.sortOrder,
      defaultTemplateId: hall.defaultTemplateId,
      tablesCount: hall._count.tables,
      responsesCount: hall.tables.reduce(
        (sum, table) => sum + table._count.responses,
        0,
      ),
    },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { hallId } = await params;
  const body = await request.json().catch(() => null);

  const existing = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!existing) return notFound("Hall");

  const data: { name?: string; slug?: string; shortLabel?: string } = {};

  if (body?.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return badRequest("name cannot be empty");
    data.name = name;
    data.slug = slugify(name);
  }

  if (body?.shortLabel !== undefined) {
    const shortLabel =
      typeof body.shortLabel === "string" ? body.shortLabel.trim() : "";
    if (!shortLabel) return badRequest("shortLabel cannot be empty");
    data.shortLabel = shortLabel;
  }

  const hall = await prisma.hall.update({ where: { id: hallId }, data });

  return NextResponse.json({ data: hall });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { hallId } = await params;

  const existing = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!existing) return notFound("Hall");

  await prisma.hall.delete({ where: { id: hallId } });

  return new NextResponse(null, { status: 204 });
}
