import path from "node:path";

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import sharp from "sharp";

import { notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ tableId: string }> };

const CARD_BACKGROUND_PATH = path.join(
  process.cwd(),
  "public",
  "qr-table-card-bg.png",
);

// Gold-frame placement measured against the exported card background
// (1123x3368px). Each box is the frame's inner whitespace where the QR sits.
const TOP_QR_BOX = { x: 313, y: 443, size: 498 };
const BOTTOM_QR_BOX = { x: 314, y: 2426, size: 489 };

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

  const qrBottom = await QRCode.toBuffer(feedbackUrl, {
    type: "png",
    width: BOTTOM_QR_BOX.size,
    margin: 0,
    color: { dark: "#6A1B1F", light: "#FFFFFF" },
  });

  const qrTop = await sharp(
    await QRCode.toBuffer(feedbackUrl, {
      type: "png",
      width: TOP_QR_BOX.size,
      margin: 0,
      color: { dark: "#6A1B1F", light: "#FFFFFF" },
    }),
  )
    .rotate(180)
    .toBuffer();

  const png = await sharp(CARD_BACKGROUND_PATH)
    .composite([
      { input: qrTop, left: TOP_QR_BOX.x, top: TOP_QR_BOX.y },
      { input: qrBottom, left: BOTTOM_QR_BOX.x, top: BOTTOM_QR_BOX.y },
    ])
    .png()
    .toBuffer();

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-masa-${table.number}.png"`,
    },
  });
}
