import { NextResponse } from "next/server";
import { createLead } from "@/lib/db/leads";

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

  try {
    await createLead({
      name: body.name!.trim(),
      email: body.email!.trim(),
      phone: body.phone!.trim(),
      preferredContact: body.preferredContact ?? "Email",
      vehicleId: body.vehicleId && body.vehicleId !== "none" ? body.vehicleId : null,
      preferredDate: body.preferredDate || null,
      preferredTime: body.preferredTime || null,
      message: body.message ?? "",
    });
  } catch (error) {
    console.error("[contact] failed to persist lead", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar la consulta. Intentá de nuevo más tarde." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
