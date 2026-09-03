import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ templateId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { templateId } = await params;

  const template = await prisma.questionTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template) return notFound("QuestionTemplate");

  const body = await request.json().catch(() => null);
  const questionIds = body?.questionIds;

  if (
    !Array.isArray(questionIds) ||
    questionIds.some((id) => typeof id !== "string")
  ) {
    return badRequest("questionIds must be an array of strings");
  }

  const existingQuestions = await prisma.templateQuestion.findMany({
    where: { templateId },
    select: { id: true },
  });
  const existingIds = new Set(existingQuestions.map((question) => question.id));

  if (
    questionIds.length !== existingIds.size ||
    questionIds.some((id: string) => !existingIds.has(id))
  ) {
    return badRequest(
      "questionIds must contain exactly the questions belonging to this template",
    );
  }

  await prisma.$transaction(
    questionIds.map((id: string, index: number) =>
      prisma.templateQuestion.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  const questions = await prisma.templateQuestion.findMany({
    where: { templateId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ data: questions });
}
