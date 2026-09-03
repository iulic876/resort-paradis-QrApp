import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function notFound(resource: string) {
  return jsonError(`${resource} not found`, 404);
}

export function badRequest(message: string) {
  return jsonError(message, 400);
}
