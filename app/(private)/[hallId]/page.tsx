import { notFound } from "next/navigation";

import { HallView } from "@/components/private/HallView";
import { prisma } from "@/lib/prisma";

export default async function HallPage({
  params,
}: {
  params: Promise<{ hallId: string }>;
}) {
  const { hallId } = await params;

  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!hall) notFound();

  const tables = await prisma.table.findMany({
    where: { hallId },
    orderBy: { number: "asc" },
    include: {
      qr: { select: { isActive: true, scanCount: true, lastScannedAt: true } },
      _count: { select: { responses: true } },
    },
  });

  const data = tables.map((table) => ({
    id: table.id,
    name: table.name,
    number: table.number,
    status: table.status,
    templateId: table.templateId,
    qrStatus: (table.qr?.isActive ? "activ" : "lipsa") as "activ" | "lipsa",
    scans: table.qr?.scanCount ?? 0,
    responses: table._count.responses,
    lastScan: table.qr?.lastScannedAt?.toISOString() ?? null,
  }));

  return <HallView hallId={hall.id} hallName={hall.name} tables={data} />;
}
