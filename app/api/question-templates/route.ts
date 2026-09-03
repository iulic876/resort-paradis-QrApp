import { NextRequest, NextResponse } from "next/server";

import { badRequest } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.questionTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      _count: { select: { tables: true } },
    },
  });

  const data = templates.map((template) => ({
    id: template.id,
    name: template.name,
    status: template.status,
    version: template.version,
    tablesCount: template._count.tables,
    questions: template.questions,
  }));

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) return badRequest("name is required");

  const template = await prisma.questionTemplate.create({
    data: { name, status: "DRAFT", version: 1 },
    include: { questions: true },
  });

  return NextResponse.json({ data: template }, { status: 201 });
}
