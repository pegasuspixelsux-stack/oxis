import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminAuth, adminStorage, SESSION_COOKIE_NAME } from "@/lib/firebase-admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// Uploads a single image to Firebase Storage and returns its public URL.
// Requires a verified dashboard session — proxy.ts doesn't cover /api routes
// outside /dashboard, so this route re-checks the session cookie itself.
export async function POST(request: Request) {
  const sessionCookie = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!sessionCookie) {
    return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
  }

  try {
    await adminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return NextResponse.json({ ok: false, error: "Sesión inválida." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Falta el archivo." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ ok: false, error: "Formato de imagen no soportado." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "La imagen supera los 8 MB." }, { status: 413 });
  }

  const ext = file.type.split("/")[1];
  const objectPath = `uploads/${randomUUID()}.${ext}`;

  try {
    const bucket = adminStorage().bucket();
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = bucket.file(objectPath);

    await blob.save(buffer, { contentType: file.type });
    await blob.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${objectPath}`;
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("[upload] failed", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo subir la imagen. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
