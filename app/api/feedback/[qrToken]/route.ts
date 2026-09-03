import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ qrToken: string }> };

async function resolveTable(qrToken: string) {
  const qr = await prisma.qrCode.findUnique({
    where: { token: qrToken },
    include: {
      table: {
        include: {
          hall: { select: { id: true, name: true, defaultTemplateId: true } },
        },
      },
    },
  });

  if (!qr || !qr.isActive) return null;
  return qr;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { qrToken } = await params;

  const qr = await resolveTable(qrToken);
  if (!qr) return notFound("Feedback form");

  const effectiveTemplateId =
    qr.table.templateId ?? qr.table.hall.defaultTemplateId;

  const questions = effectiveTemplateId
    ? await prisma.templateQuestion.findMany({
        where: { templateId: effectiveTemplateId },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return NextResponse.json({
    data: {
      table: {
        id: qr.table.id,
        name: qr.table.name,
        number: qr.table.number,
      },
      hall: {
        id: qr.table.hall.id,
        name: qr.table.hall.name,
      },
      questions,
    },
  });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { qrToken } = await params;

  const qr = await resolveTable(qrToken);
  if (!qr) return notFound("Feedback form");

  const body = await request.json().catch(() => null);
  const answers = body?.answers;
  const rating = body?.rating;
  const comment = body?.comment;

  if (!Array.isArray(answers)) {
    return badRequest("answers must be an array");
  }
  if (rating !== undefined && rating !== null && typeof rating !== "number") {
    return badRequest("rating must be a number");
  }
  if (comment !== undefined && comment !== null && typeof comment !== "string") {
    return badRequest("comment must be a string");
  }

  const response = await prisma.feedbackResponse.create({
    data: {
      tableId: qr.table.id,
      answers,
      rating: rating ?? null,
      comment: comment ?? null,
    },
  });

  return NextResponse.json({ data: response }, { status: 201 });
}
