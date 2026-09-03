import { NextRequest, NextResponse } from "next/server";
import type { InputJsonValue } from "@/lib/generated/prisma/internal/prismaNamespace";
import { JsonNull } from "@/lib/generated/prisma/internal/prismaNamespace";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { QuestionType } from "@/lib/generated/prisma/enums";

type RouteParams = {
  params: Promise<{ templateId: string; questionId: string }>;
};

const VALID_TYPES = new Set(Object.values(QuestionType));

function parseOptions(value: unknown): string[] | undefined {
  if (
    !Array.isArray(value) ||
    value.some((option) => typeof option !== "string" || !option.trim())
  ) {
    return undefined;
  }
  return value.map((option) => option.trim());
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { templateId, questionId } = await params;

  const existing = await prisma.templateQuestion.findUnique({
    where: { id: questionId },
  });
  if (!existing || existing.templateId !== templateId) {
    return notFound("TemplateQuestion");
  }

  const body = await request.json().catch(() => null);
  const data: {
    title?: string;
    type?: QuestionType;
    helper?: string | null;
    options?: InputJsonValue | typeof JsonNull;
    required?: boolean;
  } = {};

  if (body?.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return badRequest("title cannot be empty");
    data.title = title;
  }

  if (body?.type !== undefined) {
    if (
      typeof body.type !== "string" ||
      !VALID_TYPES.has(body.type as QuestionType)
    ) {
      return badRequest(`type must be one of: ${[...VALID_TYPES].join(", ")}`);
    }
    data.type = body.type as QuestionType;
  }

  if (body?.helper !== undefined) {
    if (body.helper !== null && typeof body.helper !== "string") {
      return badRequest("helper must be a string or null");
    }
    data.helper = body.helper;
  }

  if (body?.options !== undefined) {
    if (body.options === null) {
      data.options = JsonNull;
    } else {
      const options = parseOptions(body.options);
      if (options === undefined) {
        return badRequest("options must be an array of non-empty strings");
      }
      data.options = options;
    }
  }

  if (body?.required !== undefined) {
    if (typeof body.required !== "boolean") {
      return badRequest("required must be a boolean");
    }
    data.required = body.required;
  }

  const question = await prisma.templateQuestion.update({
    where: { id: questionId },
    data,
  });

  return NextResponse.json({ data: question });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { templateId, questionId } = await params;

  const existing = await prisma.templateQuestion.findUnique({
    where: { id: questionId },
  });
  if (!existing || existing.templateId !== templateId) {
    return notFound("TemplateQuestion");
  }

  await prisma.templateQuestion.delete({ where: { id: questionId } });

  return new NextResponse(null, { status: 204 });
}
