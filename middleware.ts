import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/admin") || pathname.startsWith("/client")) {
    const hasAuthCookie = req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");

    if (!hasAuthCookie) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/client/:path*"] };
