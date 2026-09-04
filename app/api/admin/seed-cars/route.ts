import { NextResponse } from "next/server";
import { adminAuth, adminDb, SESSION_COOKIE_NAME } from "@/lib/firebase-admin";
import { seedCars } from "@/lib/db/seed-cars";

// Admin-only trigger for the `cars` collection seed. Gated behind the same
// session cookie proxy.ts uses for /dashboard, so only an authenticated
// dealership user can invoke it. Safe to call repeatedly — seedCars() is a
// no-op once the collection has any documents.
export async function POST(request: Request) {
  const sessionCookie = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.slice(SESSION_COOKIE_NAME.length + 1);

  if (!sessionCookie) {
    return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
  }

  try {
    await adminAuth().verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error("[admin/seed-cars] session verification failed", error);
    return NextResponse.json({ ok: false, error: "Sesión inválida." }, { status: 401 });
  }

  try {
    const result = await seedCars(adminDb());
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[admin/seed-cars] seeding failed", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo inicializar la colección de vehículos." },
      { status: 500 }
    );
  }
}
