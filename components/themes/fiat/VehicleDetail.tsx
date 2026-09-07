"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { estimateListingPayment } from "@/lib/finance";
import type { VehicleDetailProps } from "@/components/themes/types";
import { FiatShell } from "./ui/fiat-shell";
import { FiatButton } from "./ui/fiat-button";
import { FiatField, fiatControlClass } from "./ui/fiat-field";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80";

// Copied verbatim from BMW's VehicleDetail (Global Constraint: no
// cross-theme imports).
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

export default function VehicleDetail({ car, loading, notFound, leadForm }: VehicleDetailProps) {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "fiat");

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
      <FiatShell>
        <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-[#1a1a1a]/50">
          Cargando…
        </div>
      </FiatShell>
    );
  }

  if (notFound || !car) {
    return (
      <FiatShell>
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 rounded-xl border border-[#1a1a1a]/10 bg-white p-8 shadow-sm">
            <p className="text-lg font-bold">No encontramos este vehículo</p>
            <p className="text-sm text-[#1a1a1a]/60">
              Puede que se haya vendido o que el enlace esté vencido.
            </p>
            <FiatButton href="/inventory" variant="outline">
              Volver al inventario
            </FiatButton>
          </div>
        </div>
      </FiatShell>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [car.img || FALLBACK_IMAGE];
  const features = car.features && car.features.length > 0 ? car.features : DEFAULT_FEATURES;
  const numeric = parseInt(car.price.replace(/[^0-9]/g, ""), 10);
  const monthly =
    Number.isFinite(numeric) && numeric > 0 ? estimateListingPayment(numeric) : null;
  const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, message);

  const specs = [
    { label: "Año", value: String(car.year) },
    { label: "Kilometraje", value: car.mileage || "—" },
    { label: "Tracción", value: car.drivetrain || "—" },
    { label: "Transmisión", value: car.transmission || "—" },
  ];

  return (
    <FiatShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <FiatButton href="/inventory" variant="outline" className="!px-3.5 !py-1.5 !text-xs">
          ← Inventario
        </FiatButton>

        {/* Gallery */}
        <div className="mt-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F3ECE0] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
            <img src={images[activeImage]} alt={car.title} className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold">
              {activeImage + 1} / {images.length}
            </span>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === i
                      ? "border-[var(--fiat-accent)]"
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
        <div className="mt-7">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fiat-accent)]">
            {car.make} · {car.bodyStyle}
          </span>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {car.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-extrabold tracking-tight">{car.price}</span>
            {monthly && (
              <span className="text-sm text-[#1a1a1a]/60">
                desde{" "}
                <span className="font-bold text-[var(--fiat-accent)]">
                  ${Math.round(monthly).toLocaleString("en-US")}/mes
                </span>{" "}
                · 30% de anticipo, TNA 6,9% a 60 meses
              </span>
            )}
          </div>
        </div>

        {/* Spec chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {specs.map((spec) => (
            <span
              key={spec.label}
              className="rounded-full border border-[#1a1a1a]/10 bg-white px-3 py-1.5 text-xs shadow-sm"
            >
              <span className="text-[#1a1a1a]/45">{spec.label}: </span>
              <span className="font-semibold">{spec.value}</span>
            </span>
          ))}
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">
              Descripción
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#1a1a1a]/75">
              {car.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">
            Equipamiento
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {features.map((feature, i) => (
              <span
                key={feature + i}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1a1a1a]/10 bg-white px-3 py-1.5 text-xs shadow-sm"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--fiat-accent)]" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Inquiry card */}
        <div className="mt-10 rounded-2xl border border-[#1a1a1a]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight">Consultá por este vehículo</h2>
          <p className="mt-1.5 text-sm text-[#1a1a1a]/60">
            Te responde un asesor de {logoText} a la brevedad.
          </p>

          {leadForm.success ? (
            <div className="mt-6 rounded-xl bg-[var(--fiat-accent)] p-6 text-white">
              <h3 className="text-base font-bold">Consulta enviada</h3>
              <p className="mt-1.5 text-sm text-white/85">
                Un asesor de {logoText} se comunica a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => leadForm.reset()}
                className="mt-4 rounded-full border border-white/60 px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-white hover:text-[var(--fiat-accent)]"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FiatField label="Nombre completo">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={fiatControlClass}
                  />
                </FiatField>
                <FiatField label="Teléfono">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={fiatControlClass}
                  />
                </FiatField>
              </div>

              <FiatField label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={fiatControlClass}
                />
              </FiatField>

              <FiatField label="Mensaje">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={fiatControlClass}
                />
              </FiatField>

              {leadForm.error && (
                <p className="text-sm font-semibold text-[var(--fiat-accent)]">{leadForm.error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <FiatButton type="submit" disabled={leadForm.submitting}>
                  {leadForm.submitting ? "Enviando…" : "Enviar al equipo"}
                </FiatButton>
                <FiatButton href={whatsappUrl} external variant="outline">
                  WhatsApp
                </FiatButton>
              </div>
            </form>
          )}
        </div>
      </article>
    </FiatShell>
  );
}
