import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/auth";

const publicPathPrefixes = [
  "/login",
  "/feedback",
  "/api/auth",
  "/api/feedback",
  "/api/qr",
];

const adminApiPrefixes = [
  "/api/halls",
  "/api/question-templates",
  "/api/tables",
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = await isAdminSessionValid(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Autentificare necesara" },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};

function isProtectedPath(pathname: string) {
  if (pathname.includes(".") && !pathname.startsWith("/api/")) {
    return false;
  }

  if (
    publicPathPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return false;
  }

  if (pathname.startsWith("/api/")) {
    return adminApiPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  }

  return true;
}
