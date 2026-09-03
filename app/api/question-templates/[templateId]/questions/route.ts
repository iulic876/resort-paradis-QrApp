import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { QuestionType } from "@/lib/generated/prisma/enums";

type RouteParams = { params: Promise<{ templateId: string }> };

const VALID_TYPES = new Set(Object.values(QuestionType));

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { templateId } = await params;

  const template = await prisma.questionTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template) return notFound("QuestionTemplate");

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const type = body?.type;
  const helper = typeof body?.helper === "string" ? body.helper.trim() : null;
  const required = typeof body?.required === "boolean" ? body.required : false;

  if (!title) return badRequest("title is required");
  if (typeof type !== "string" || !VALID_TYPES.has(type as QuestionType)) {
    return badRequest(`type must be one of: ${[...VALID_TYPES].join(", ")}`);
  }

  const maxSortOrder = await prisma.templateQuestion.aggregate({
    where: { templateId },
    _max: { sortOrder: true },
  });

  const question = await prisma.templateQuestion.create({
    data: {
      templateId,
      title,
      type: type as QuestionType,
      helper,
      required,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json({ data: question }, { status: 201 });
}
