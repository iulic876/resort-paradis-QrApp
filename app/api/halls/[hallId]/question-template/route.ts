import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ hallId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { hallId } = await params;

  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!hall) return notFound("Hall");

  const body = await request.json().catch(() => null);
  const templateId = body?.templateId;

  if (templateId !== null && typeof templateId !== "string") {
    return badRequest("templateId must be a string or null");
  }

  if (templateId !== null) {
    const template = await prisma.questionTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) return notFound("QuestionTemplate");
  }

  const updated = await prisma.hall.update({
    where: { id: hallId },
    data: { defaultTemplateId: templateId },
  });

  return NextResponse.json({ data: updated });
}
