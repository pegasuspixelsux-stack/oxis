import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminAuth, adminStorage, SESSION_COOKIE_NAME } from "@/lib/firebase-admin";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_VIDEO_BYTES = 64 * 1024 * 1024; // 64 MB — theme hero backgrounds

// Uploads a single image or video to Firebase Storage and returns its
// public URL. Requires a verified dashboard session — proxy.ts doesn't
// cover /api routes outside /dashboard, so this route re-checks the
// session cookie itself.
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

  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { ok: false, error: "Formato no soportado. Usá JPG/PNG/WebP/AVIF o MP4/WebM." },
      { status: 415 }
    );
  }
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { ok: false, error: `El archivo supera los ${Math.round(maxBytes / 1024 / 1024)} MB.` },
      { status: 413 }
    );
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
      { ok: false, error: "No se pudo subir el archivo. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
