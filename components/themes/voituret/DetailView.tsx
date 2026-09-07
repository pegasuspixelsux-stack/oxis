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
import { VoituretShell } from "./ui/voituret-shell";
import { VoituretButton } from "./ui/voituret-button";
import { VoituretField, voituretControlClass } from "./ui/voituret-field";

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

export default function DetailView({ car, loading, notFound, leadForm }: VehicleDetailProps) {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "voituret");

  const [activeImage, setActiveImage] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (car) {
      setMessage(
        `Hola, quisiera consultar por el ${car.title} (${car.price}). ¿Sigue disponible?`
      );
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
      <VoituretShell>
        <div className="flex min-h-[50vh] items-center justify-center font-[family-name:var(--font-voituret-serif)] text-lg font-light text-[#1A1A1A]/50">
          Cargando…
        </div>
      </VoituretShell>
    );
  }

  if (notFound || !car) {
    return (
      <VoituretShell>
        <div className="mx-auto max-w-2xl px-6 py-28 sm:px-10">
          <div className="flex flex-col items-start gap-5 border border-[#1A1A1A]/12 p-10">
            <p className="font-[family-name:var(--font-voituret-serif)] text-2xl font-light">
              No encontramos esta pieza
            </p>
            <p className="text-sm text-[#1A1A1A]/55">
              Puede que se haya adjudicado o que el enlace esté vencido.
            </p>
            <VoituretButton href="/inventory" variant="outline">
              Volver a la colección
            </VoituretButton>
          </div>
        </div>
      </VoituretShell>
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
    <VoituretShell>
      <article className="mx-auto max-w-5xl px-6 py-14 sm:px-10">
        <VoituretButton href="/inventory" variant="outline">
          Colección
        </VoituretButton>

        {/* Image spread */}
        <div className="mt-10">
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#1A1A1A]/12 bg-[#EFEAE1]">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
            <img src={images[activeImage]} alt={car.title} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-none border transition-colors ${
                    activeImage === i
                      ? "border-[var(--voituret-accent)]"
                      : "border-[#1A1A1A]/15 opacity-55 hover:opacity-100"
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
        <div className="mt-14 grid grid-cols-1 gap-10 border-b border-[#1A1A1A]/12 pb-12 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[var(--voituret-accent)]">
              {car.make} · {car.bodyStyle || "Automóvil"}
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-voituret-serif)] text-4xl font-light leading-[1.15] sm:text-5xl">
              {car.title}
            </h1>
          </div>

          <div>
            <span className="block font-[family-name:var(--font-voituret-serif)] text-3xl font-light">
              {car.price}
            </span>
            {monthly !== null && downPayment !== null && (
              <dl className="mt-4 flex flex-col gap-2 border-t border-[#1A1A1A]/12 pt-4 text-xs text-[#1A1A1A]/55">
                <div className="flex justify-between">
                  <dt>Cuota estimada</dt>
                  <dd className="text-[var(--voituret-accent)]">
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
            <VoituretButton href="#consulta" className="mt-6 w-full">
              Consultar
            </VoituretButton>
          </div>
        </div>

        {/* Spec list */}
        <div className="mt-14">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#1A1A1A]/45">
            Ficha
          </h2>
          <dl className="mt-6 divide-y divide-[#1A1A1A]/12 border-t border-[#1A1A1A]/12">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between py-4">
                <dt className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/50">
                  {spec.label}
                </dt>
                <dd className="text-sm text-[#1A1A1A]">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-14">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#1A1A1A]/45">
              Nota de curaduría
            </h2>
            <p className="mt-6 max-w-2xl whitespace-pre-line font-[family-name:var(--font-voituret-serif)] text-lg font-light leading-relaxed text-[#1A1A1A]/75">
              {car.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-14">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#1A1A1A]/45">
            Equipamiento
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
            {features.map((feature, i) => (
              <li
                key={feature + i}
                className="flex items-baseline gap-3 border-b border-[#1A1A1A]/12 pb-3 text-sm text-[#1A1A1A]/70"
              >
                <span aria-hidden className="text-[var(--voituret-accent)]">
                  —
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Inquiry form */}
        <div id="consulta" className="mt-16 border-t border-[#1A1A1A]/15 pt-12">
          <h2 className="font-[family-name:var(--font-voituret-serif)] text-3xl font-light">
            Consultá por esta pieza
          </h2>
          <p className="mt-4 text-sm text-[#1A1A1A]/60">
            Te responde un asesor de {logoText} dentro de un día hábil.
          </p>

          {leadForm.success ? (
            <div className="mt-10 border border-[#1A1A1A]/15 p-8">
              <h3 className="font-[family-name:var(--font-voituret-serif)] text-xl font-light">
                Consulta recibida
              </h3>
              <p className="mt-3 text-sm text-[#1A1A1A]/60">
                Un asesor de {logoText} se comunica a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => leadForm.reset()}
                className="mt-6 rounded-none border border-[#1A1A1A]/30 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#1A1A1A] transition-colors hover:border-[var(--voituret-accent)] hover:text-[var(--voituret-accent)]"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <VoituretField label="Nombre completo">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={voituretControlClass}
                  />
                </VoituretField>
                <VoituretField label="Teléfono">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={voituretControlClass}
                  />
                </VoituretField>
              </div>

              <VoituretField label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={voituretControlClass}
                />
              </VoituretField>

              <VoituretField label="Mensaje">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={voituretControlClass}
                />
              </VoituretField>

              {leadForm.error && (
                <p className="text-sm font-medium text-[#8A2B2B]">{leadForm.error}</p>
              )}

              <div className="flex flex-col gap-4 sm:flex-row">
                <VoituretButton type="submit" disabled={leadForm.submitting}>
                  {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
                </VoituretButton>
                <VoituretButton href={whatsappUrl} external variant="outline">
                  Consultar por WhatsApp
                </VoituretButton>
              </div>
            </form>
          )}
        </div>
      </article>
    </VoituretShell>
  );
}
