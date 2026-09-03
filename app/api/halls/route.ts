import { NextRequest, NextResponse } from "next/server";

import { badRequest } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function GET() {
  const halls = await prisma.hall.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { tables: true } },
      tables: { select: { _count: { select: { responses: true } } } },
    },
  });

  const data = halls.map((hall) => ({
    id: hall.id,
    name: hall.name,
    slug: hall.slug,
    shortLabel: hall.shortLabel,
    sortOrder: hall.sortOrder,
    tablesCount: hall._count.tables,
    responsesCount: hall.tables.reduce(
      (sum, table) => sum + table._count.responses,
      0,
    ),
  }));

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const shortLabel =
    typeof body?.shortLabel === "string" ? body.shortLabel.trim() : "";

  if (!name) return badRequest("name is required");
  if (!shortLabel) return badRequest("shortLabel is required");

  const slug = slugify(name);
  if (!slug) return badRequest("name must contain letters or numbers");

  const maxSortOrder = await prisma.hall.aggregate({
    _max: { sortOrder: true },
  });

  const hall = await prisma.hall.create({
    data: {
      name,
      slug,
      shortLabel,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json({ data: hall }, { status: 201 });
}
