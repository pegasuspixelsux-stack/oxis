import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  preferredContact?: string;
  vehicleId?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!body.name?.trim()) errors.name = "El nombre es obligatorio.";
  if (!body.email?.trim() || !EMAIL_RE.test(body.email.trim())) {
    errors.email = "Se requiere un correo electrónico válido.";
  }
  if (!body.phone?.trim() || body.phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Se requiere un número de teléfono válido.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // In production this would persist the lead and notify the sales team.
  console.log("[contact] new inquiry", {
    name: body.name,
    email: body.email,
    vehicleId: body.vehicleId ?? null,
  });

  return NextResponse.json({ ok: true });
}
