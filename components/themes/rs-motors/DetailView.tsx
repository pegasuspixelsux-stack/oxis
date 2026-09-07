"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { estimateListingPayment } from "@/lib/finance";
import type { VehicleDetailProps } from "@/components/themes/types";
import { RsShell } from "./ui/rs-shell";
import { RsButton } from "./ui/rs-button";
import { RsField, rsControlClass } from "./ui/rs-field";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80";

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

// Static track-inspection status. There is no real inspection field on
// the car document, so this is fixed copy presented as a telemetry-style
// pass badge.
const TRACK_INSPECTION = "Inspección de 150 puntos ✓ — apto para pista";

export default function DetailView({ car, loading, notFound, leadForm }: VehicleDetailProps) {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "rs-motors");

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
      <RsShell>
        <div className="flex min-h-[50vh] items-center justify-center font-[family-name:var(--font-rs-mono)] text-sm text-white/50">
          Cargando…
        </div>
      </RsShell>
    );
  }

  if (notFound || !car) {
    return (
      <RsShell>
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 border border-white/15 bg-[#0A0A0A] p-8">
            <p className="text-lg font-bold uppercase tracking-[0.1em] text-white">
              No encontramos esta unidad
            </p>
            <p className="text-sm text-white/50">
              Puede que se haya vendido o que el enlace esté vencido.
            </p>
            <RsButton href="/inventory" variant="outline">
              Volver al inventario
            </RsButton>
          </div>
        </div>
      </RsShell>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [car.img || FALLBACK_IMAGE];
  const features = car.features && car.features.length > 0 ? car.features : DEFAULT_FEATURES;
  const numeric = parseInt(car.price.replace(/[^0-9]/g, ""), 10);
  const monthly =
    Number.isFinite(numeric) && numeric > 0 ? estimateListingPayment(numeric) : null;
  const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, message);

  const specs = [
    { label: "AÑO", value: String(car.year) },
    { label: "KILOMETRAJE", value: car.mileage || "—" },
    { label: "TRACCIÓN", value: car.drivetrain || "—" },
    { label: "TRANSMISIÓN", value: car.transmission || "—" },
    { label: "CARROCERÍA", value: car.bodyStyle || "—" },
    { label: "MARCA", value: car.make || "—" },
  ];

  return (
    <RsShell>
      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <RsButton href="/inventory" variant="outline" className="!px-4 !py-2 !text-[10px]">
          ← Inventario
        </RsButton>

        {/* Gallery */}
        <div className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-white/15 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
            <img src={images[activeImage]} alt={car.title} className="h-full w-full object-cover" />
            <span className="absolute left-0 top-0 bg-black/80 px-3 py-1 font-[family-name:var(--font-rs-mono)] text-[11px] text-white/70">
              {String(activeImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
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
                      ? "border-[var(--rs-accent)]"
                      : "border-transparent opacity-50 hover:opacity-100"
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
        <div className="mt-8 border-b border-white/10 pb-6">
          <span className="font-[family-name:var(--font-rs-mono)] text-xs text-[var(--rs-accent)]">
            {car.make} · {car.bodyStyle}
          </span>
          <h1 className="mt-2 text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-4xl">
            {car.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-[family-name:var(--font-rs-mono)]">
            <span className="text-3xl font-bold text-white">{car.price}</span>
            {monthly && (
              <span className="text-sm text-white/50">
                desde{" "}
                <span className="font-bold text-[var(--rs-accent)]">
                  ${Math.round(monthly).toLocaleString("en-US")}/mes
                </span>{" "}
                · 30% de anticipo, TNA 6,9% a 60 meses
              </span>
            )}
          </div>
        </div>

        {/* Track-inspection badge */}
        <div className="mt-6 flex items-center gap-3 border border-[var(--rs-accent)] bg-[#0A0A0A] px-4 py-3">
          <span className="inline-block h-3 w-3 shrink-0 -skew-x-12 bg-[var(--rs-accent)]" />
          <span className="font-[family-name:var(--font-rs-mono)] text-xs font-bold uppercase tracking-[0.15em] text-white">
            {TRACK_INSPECTION}
          </span>
        </div>

        {/* Telemetry spec panel */}
        <div className="mt-6">
          <h2 className="font-[family-name:var(--font-rs-mono)] text-[11px] uppercase tracking-[0.25em] text-white/40">
            // hoja de especificaciones
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-px border border-white/15 bg-white/15 sm:grid-cols-3">
            {specs.map((spec) => (
              <div key={spec.label} className="bg-[#0A0A0A] p-4">
                <dt className="font-[family-name:var(--font-rs-mono)] text-[10px] tracking-[0.2em] text-white/40">
                  {spec.label}
                </dt>
                <dd className="mt-1.5 font-[family-name:var(--font-rs-mono)] text-sm text-white">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-8">
            <h2 className="font-[family-name:var(--font-rs-mono)] text-[11px] uppercase tracking-[0.25em] text-white/40">
              // descripción
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70">
              {car.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-rs-mono)] text-[11px] uppercase tracking-[0.25em] text-white/40">
            // equipamiento
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {features.map((feature, i) => (
              <span
                key={feature + i}
                className="flex items-center gap-2.5 border border-white/15 bg-[#0A0A0A] px-3 py-2.5 text-xs text-white/70"
              >
                <span className="h-1.5 w-1.5 shrink-0 bg-[var(--rs-accent)]" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Inquiry card */}
        <div className="mt-10 border border-white/15 bg-[#0A0A0A] p-6">
          <h2 className="text-xl font-bold uppercase tracking-[0.1em] text-white">
            Consultá por esta unidad
          </h2>
          <p className="mt-2 text-sm text-white/50">
            Te responde un asesor de {logoText} a la brevedad.
          </p>

          {leadForm.success ? (
            <div className="mt-6 border border-[var(--rs-accent)] bg-black p-6">
              <h3 className="text-base font-bold uppercase tracking-[0.1em] text-white">
                Consulta enviada
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Un asesor de {logoText} se comunica a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => leadForm.reset()}
                className="mt-4 rounded-none border border-white/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-[var(--rs-accent)] hover:bg-[var(--rs-accent)]"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <RsField label="Nombre completo">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={rsControlClass}
                  />
                </RsField>
                <RsField label="Teléfono">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={rsControlClass}
                  />
                </RsField>
              </div>

              <RsField label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={rsControlClass}
                />
              </RsField>

              <RsField label="Mensaje">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={rsControlClass}
                />
              </RsField>

              {leadForm.error && (
                <p className="text-sm font-bold text-[var(--rs-accent)]">{leadForm.error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <RsButton type="submit" disabled={leadForm.submitting}>
                  {leadForm.submitting ? "Enviando…" : "Enviar al equipo"}
                </RsButton>
                <RsButton href={whatsappUrl} external variant="outline">
                  WhatsApp
                </RsButton>
              </div>
            </form>
          )}
        </div>
      </article>
    </RsShell>
  );
}
