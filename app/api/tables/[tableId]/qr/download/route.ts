import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

import { notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ tableId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { qr: true },
  });

  if (!table) return notFound("Table");
  if (!table.qr) return notFound("QrCode");

  const feedbackUrl = new URL(
    `/feedback/${table.qr.token}`,
    request.nextUrl.origin,
  ).toString();

  const png = await QRCode.toBuffer(feedbackUrl, {
    type: "png",
    width: 512,
    margin: 2,
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-masa-${table.number}.png"`,
    },
  });
}
