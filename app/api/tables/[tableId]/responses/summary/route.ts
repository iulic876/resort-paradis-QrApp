import { NextRequest, NextResponse } from "next/server";

import { notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ tableId: string }> };

type Answer = { questionId: string; value: unknown };

function isAnswerArray(value: unknown): value is Answer[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "questionId" in item &&
        typeof (item as Answer).questionId === "string",
    )
  );
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) return notFound("Table");

  const responses = await prisma.feedbackResponse.findMany({
    where: { tableId },
    select: { answers: true },
  });

  const byQuestion = new Map<
    string,
    { numericValues: number[]; textValues: string[] }
  >();

  for (const response of responses) {
    if (!isAnswerArray(response.answers)) continue;

    for (const answer of response.answers) {
      const bucket = byQuestion.get(answer.questionId) ?? {
        numericValues: [],
        textValues: [],
      };

      if (typeof answer.value === "number") {
        bucket.numericValues.push(answer.value);
      } else if (typeof answer.value === "string") {
        bucket.textValues.push(answer.value);
      }

      byQuestion.set(answer.questionId, bucket);
    }
  }

  const data = [...byQuestion.entries()].map(([questionId, bucket]) => {
    const average = bucket.numericValues.length
      ? bucket.numericValues.reduce((sum, value) => sum + value, 0) /
        bucket.numericValues.length
      : null;

    const optionCounts: Record<string, number> = {};
    for (const value of bucket.textValues) {
      optionCounts[value] = (optionCounts[value] ?? 0) + 1;
    }

    return {
      questionId,
      responseCount: bucket.numericValues.length + bucket.textValues.length,
      average,
      optionCounts,
    };
  });

  return NextResponse.json({ data });
}
