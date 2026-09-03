import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { TemplateStatus } from "@/lib/generated/prisma/enums";

type RouteParams = { params: Promise<{ templateId: string }> };

const VALID_STATUSES = new Set(Object.values(TemplateStatus));

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { templateId } = await params;

  const template = await prisma.questionTemplate.findUnique({
    where: { id: templateId },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });

  if (!template) return notFound("QuestionTemplate");

  return NextResponse.json({ data: template });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { templateId } = await params;

  const existing = await prisma.questionTemplate.findUnique({
    where: { id: templateId },
  });
  if (!existing) return notFound("QuestionTemplate");

  const body = await request.json().catch(() => null);
  const data: { name?: string; status?: TemplateStatus; version?: number } =
    {};

  if (body?.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return badRequest("name cannot be empty");
    data.name = name;
  }

  if (body?.status !== undefined) {
    if (
      typeof body.status !== "string" ||
      !VALID_STATUSES.has(body.status as TemplateStatus)
    ) {
      return badRequest(
        `status must be one of: ${[...VALID_STATUSES].join(", ")}`,
      );
    }
    data.status = body.status as TemplateStatus;

    if (body.status === "ACTIVE" && existing.status !== "ACTIVE") {
      data.version = existing.version + 1;
    }
  }

  const template = await prisma.questionTemplate.update({
    where: { id: templateId },
    data,
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ data: template });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { templateId } = await params;

  const existing = await prisma.questionTemplate.findUnique({
    where: { id: templateId },
  });
  if (!existing) return notFound("QuestionTemplate");

  await prisma.questionTemplate.delete({ where: { id: templateId } });

  return new NextResponse(null, { status: 204 });
}
