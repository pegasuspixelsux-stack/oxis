import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth, SESSION_COOKIE_NAME } from "@/lib/firebase-admin";

export default async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return redirectToLogin(request);
  }

  try {
    // `true` checks server-side revocation (e.g. after a password change).
    await adminAuth().verifySessionCookie(sessionCookie, true);
    return NextResponse.next();
  } catch (error) {
    console.error("[proxy] session cookie verification failed", error);
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const url = new URL("/login", request.url);
  url.searchParams.set("redirect_url", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard(.*)"],
};
