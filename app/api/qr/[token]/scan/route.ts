import { NextRequest, NextResponse } from "next/server";

import { notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ token: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { token } = await params;

  const qr = await prisma.qrCode.findUnique({ where: { token } });
  if (!qr || !qr.isActive) return notFound("QrCode");

  const updated = await prisma.qrCode.update({
    where: { token },
    data: {
      scanCount: { increment: 1 },
      lastScannedAt: new Date(),
    },
  });

  return NextResponse.json({
    data: { scanCount: updated.scanCount, lastScannedAt: updated.lastScannedAt },
  });
}
