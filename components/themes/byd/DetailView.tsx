"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  estimateListingPayment,
  ESTIMATE_APR,
  ESTIMATE_TERM_MONTHS,
  ESTIMATE_DOWN_PERCENT,
} from "@/lib/finance";
import type { VehicleDetailProps } from "@/components/themes/types";
import { BydShell } from "./ui/byd-shell";
import { BydButton } from "./ui/byd-button";
import { BydField, bydControlClass } from "./ui/byd-field";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80";

// Copied verbatim from BMW's VehicleDetail (hard rule: no cross-theme
// imports).
const DEFAULT_FEATURES = [
  "Interior de cuero premium",
  "Techo panorámico",
  "Sistema de navegación",
  "Audio Harman Kardon",
  "Control de crucero adaptativo",
  "Volante calefaccionado",
  "Apple CarPlay / Android Auto",
  "Faros LED matriciales",
  "Encendido y acceso sin llave",
  "Cámara de 360°",
];

// Static tech callouts. There is no real battery / range field on the car
// document, so these are fixed clean-tech copy shown alongside the real
// spec tiles.
const TECH_CALLOUTS = [
  { value: "Total", label: "Conectividad a bordo" },
  { value: "Nivel 2", label: "Asistencias de conducción" },
  { value: "Cero", label: "Fricción en la compra" },
];

export default function DetailView({ car, loading, notFound, leadForm }: VehicleDetailProps) {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "byd");

  const [activeImage, setActiveImage] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (car) {
      setMessage(`Hola, estoy viendo el ${car.title} (${car.price}). ¿Sigue disponible?`);
    }
    setActiveImage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!car) return;
    try {
      await leadForm.submit({
        name,
        email,
        phone,
        preferredContact: "WhatsApp",
        vehicleId: car.id,
        message,
      });
    } catch {
      /* leadForm.error is set by the hook */
    }
  }

  if (loading) {
    return (
      <BydShell>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#5A6B7D]">
          Cargando…
        </div>
      </BydShell>
    );
  }

  if (notFound || !car) {
    return (
      <BydShell>
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 border border-[#0A1A2F]/10 bg-white p-8">
            <p className="font-[family-name:var(--font-byd-display)] text-lg font-bold tracking-tight">
              No encontramos este vehículo
            </p>
            <p className="text-sm text-[#1E2A38]/60">
              Puede que se haya vendido o que el enlace esté vencido.
            </p>
            <BydButton href="/inventory" variant="outline">
              Volver al inventario
            </BydButton>
          </div>
        </div>
      </BydShell>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [car.img || FALLBACK_IMAGE];
  const features = car.features && car.features.length > 0 ? car.features : DEFAULT_FEATURES;
  const numeric = parseInt(car.price.replace(/[^0-9]/g, ""), 10);
  const priceValue = Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  const monthly = priceValue !== null ? estimateListingPayment(priceValue) : null;
  const downPayment = priceValue !== null ? priceValue * ESTIMATE_DOWN_PERCENT : null;
  const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, message);

  const specs = [
    { label: "Año", value: String(car.year) },
    { label: "Kilometraje", value: car.mileage || "—" },
    { label: "Tracción", value: car.drivetrain || "—" },
    { label: "Transmisión", value: car.transmission || "—" },
    { label: "Carrocería", value: car.bodyStyle || "—" },
  ];

  return (
    <BydShell>
      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <BydButton href="/inventory" variant="outline" className="!px-3.5 !py-2 !text-xs">
          ← Inventario
        </BydButton>

        {/* Gallery */}
        <div className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-[var(--byd-accent)]/30 bg-[#E8ECF1]">
            <span className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[var(--byd-accent)] to-[#00B4D8]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
            <img src={images[activeImage]} alt={car.title} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-none border-2 transition-colors ${
                    activeImage === i
                      ? "border-[var(--byd-accent)]"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of an arbitrary URL */}
                  <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title + price */}
        <div className="mt-8 grid grid-cols-1 gap-6 border-b border-[#0A1A2F]/10 pb-8 lg:grid-cols-[1fr_320px]">
          <div>
            <span className="font-[family-name:var(--font-byd-display)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--byd-accent)]">
              {car.make} · {car.bodyStyle}
            </span>
            <h1 className="mt-2 font-[family-name:var(--font-byd-display)] text-3xl font-bold leading-tight tracking-tighter sm:text-4xl">
              {car.title}
            </h1>
          </div>

          <div className="border border-[#0A1A2F]/10 bg-white p-5">
            <span className="block font-[family-name:var(--font-byd-display)] text-2xl font-bold">
              {car.price}
            </span>
            {monthly !== null && downPayment !== null && (
              <dl className="mt-3 flex flex-col gap-1.5 border-t border-[#0A1A2F]/10 pt-3 text-xs text-[#1E2A38]/60">
                <div className="flex justify-between">
                  <dt>Cuota estimada</dt>
                  <dd className="font-semibold text-[var(--byd-accent)]">
                    ${Math.round(monthly).toLocaleString("en-US")}/mes
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Entrega inicial</dt>
                  <dd>${Math.round(downPayment).toLocaleString("en-US")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Plan</dt>
                  <dd>
                    {ESTIMATE_TERM_MONTHS} meses · TNA {ESTIMATE_APR.toFixed(1)}%
                  </dd>
                </div>
              </dl>
            )}
            <BydButton href="#consulta" className="mt-4 w-full">
              Consultar
            </BydButton>
          </div>
        </div>

        {/* Spec callout grid */}
        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-byd-display)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5A6B7D]">
            Especificaciones
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-px border border-[#0A1A2F]/10 bg-[#0A1A2F]/10 sm:grid-cols-3 lg:grid-cols-4">
            {specs.map((spec) => (
              <div key={spec.label} className="bg-white p-5">
                <span className="block font-[family-name:var(--font-byd-display)] text-xl font-bold tracking-tight text-[#0A1A2F]">
                  {spec.value}
                </span>
                <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#5A6B7D]">
                  {spec.label}
                </span>
              </div>
            ))}
            {TECH_CALLOUTS.map((c) => (
              <div key={c.label} className="bg-white p-5">
                <span className="block font-[family-name:var(--font-byd-display)] text-xl font-bold tracking-tight text-[var(--byd-accent)]">
                  {c.value}
                </span>
                <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#5A6B7D]">
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-8">
            <h2 className="font-[family-name:var(--font-byd-display)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5A6B7D]">
              Descripción
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#1E2A38]/70">
              {car.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-byd-display)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5A6B7D]">
            Tecnología a bordo
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {features.map((feature, i) => (
              <li
                key={feature + i}
                className="flex items-center gap-2.5 border border-[#0A1A2F]/10 bg-white px-3 py-2.5 text-sm text-[#1E2A38]/70"
              >
                <span aria-hidden className="text-[var(--byd-accent)]">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Inquiry form */}
        <div id="consulta" className="mt-10 border border-[#0A1A2F]/10 bg-white p-6">
          <h2 className="font-[family-name:var(--font-byd-display)] text-xl font-bold tracking-tight">
            Consultá por este vehículo
          </h2>
          <p className="mt-2 text-sm text-[#1E2A38]/60">
            Te responde un asesor de {logoText} dentro de un día hábil.
          </p>

          {leadForm.success ? (
            <div className="mt-6 border border-[var(--byd-accent)]/30 bg-[#F1F4F7] p-6">
              <h3 className="text-base font-semibold">Consulta enviada</h3>
              <p className="mt-2 text-sm text-[#1E2A38]/65">
                Un asesor de {logoText} se comunica a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => leadForm.reset()}
                className="mt-4 rounded-none border border-[#0A1A2F]/20 bg-white px-4 py-2 text-sm font-medium text-[#0A1A2F] transition-colors hover:border-[var(--byd-accent)] hover:text-[var(--byd-accent)]"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <BydField label="Nombre completo">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={bydControlClass}
                  />
                </BydField>
                <BydField label="Teléfono">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={bydControlClass}
                  />
                </BydField>
              </div>

              <BydField label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={bydControlClass}
                />
              </BydField>

              <BydField label="Mensaje">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={bydControlClass}
                />
              </BydField>

              {leadForm.error && (
                <p className="text-sm font-medium text-[#B42318]">{leadForm.error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <BydButton type="submit" disabled={leadForm.submitting}>
                  {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
                </BydButton>
                <BydButton href={whatsappUrl} external variant="outline">
                  Consultar por WhatsApp
                </BydButton>
              </div>
            </form>
          )}
        </div>
      </article>
    </BydShell>
  );
}
