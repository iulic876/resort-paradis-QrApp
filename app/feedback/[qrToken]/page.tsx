import { notFound } from "next/navigation";

import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ qrToken: string }> };

async function getFeedbackContext(qrToken: string) {
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

  const effectiveTemplateId =
    qr.table.templateId ?? qr.table.hall.defaultTemplateId;

  const questions = effectiveTemplateId
    ? await prisma.templateQuestion.findMany({
        where: { templateId: effectiveTemplateId },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return {
    table: {
      id: qr.table.id,
      name: qr.table.name,
      number: qr.table.number,
    },
    hall: {
      id: qr.table.hall.id,
      name: qr.table.hall.name,
    },
    questions: questions.map((question) => ({
      id: question.id,
      title: question.title,
      type: question.type,
      helper: question.helper,
      options: Array.isArray(question.options)
        ? (question.options as string[])
        : null,
      required: question.required,
    })),
  };
}

export default async function FeedbackPage({ params }: PageProps) {
  const { qrToken } = await params;
  const context = await getFeedbackContext(qrToken);

  if (!context) notFound();

  return (
    <FeedbackForm
      hallName={context.hall.name}
      qrToken={qrToken}
      questions={context.questions}
      tableName={context.table.name}
    />
  );
}
