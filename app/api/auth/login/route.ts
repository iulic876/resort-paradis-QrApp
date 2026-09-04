import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  safeRedirectPath,
  verifyAdminPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password");
  const nextPath = safeRedirectPath(formData.get("next"));

  if (typeof password !== "string") {
    return redirectToLogin(request, "invalid", nextPath);
  }

  const isValid = await verifyAdminPassword(password);
  if (!isValid) {
    return redirectToLogin(request, "invalid", nextPath);
  }

  const token = await createAdminSessionToken();
  if (!token) {
    return redirectToLogin(request, "config", nextPath);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), {
    status: 303,
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function redirectToLogin(
  request: NextRequest,
  error: "config" | "invalid",
  nextPath: string,
) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  url.searchParams.set("next", nextPath);
  return NextResponse.redirect(url, { status: 303 });
}
