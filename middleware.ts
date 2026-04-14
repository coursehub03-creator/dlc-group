import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p.startsWith("/admin") || p.startsWith("/client")) {
    // Placeholder guard; replace with token/session validation.
    const isAuthed = req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");
    if (!isAuthed) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/client/:path*"] };
