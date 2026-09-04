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

  // The homepage form always sends both, but the Agente widget collects a
  // single "email o teléfono" answer — accept whichever one is present and
  // valid, only failing when neither is. A field that IS present still has
  // to be well-formed.
  const emailProvided = Boolean(body.email?.trim());
  const phoneProvided = Boolean(body.phone?.trim());
  const emailValid = emailProvided && EMAIL_RE.test(body.email!.trim());
  const phoneValid = phoneProvided && body.phone!.replace(/\D/g, "").length >= 7;

  if (emailProvided && !emailValid) errors.email = "Se requiere un correo electrónico válido.";
  if (phoneProvided && !phoneValid) errors.phone = "Se requiere un número de teléfono válido.";
  if (!emailValid && !phoneValid && !errors.email && !errors.phone) {
    errors.contact = "Se requiere un correo electrónico o teléfono válido.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  try {
    await createLead({
      name: body.name!.trim(),
      email: body.email?.trim() ?? "",
      phone: body.phone?.trim() ?? "",
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
