import { NextResponse } from "next/server";
import { adminAuth, SESSION_COOKIE_MAX_AGE_MS, SESSION_COOKIE_NAME } from "@/lib/firebase-admin";

// Exchanges a Firebase client ID token for a server-verifiable session cookie,
// so proxy.ts (and server components) can gate /dashboard without shipping
// any protected data before authentication is confirmed server-side.
export async function POST(request: Request) {
  let idToken: string | undefined;
  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Falta el token de sesión." }, { status: 400 });
  }

  try {
    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_COOKIE_MAX_AGE_MS / 1000,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("[auth/session] failed to create session cookie", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo iniciar la sesión. Intentá de nuevo." },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
