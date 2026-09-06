"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  estimateListingPayment,
  ESTIMATE_APR,
  ESTIMATE_TERM_MONTHS,
  ESTIMATE_DOWN_PERCENT,
} from "@/lib/finance";
import type { VehicleDetailProps } from "@/components/themes/types";
import { RcShell } from "./ui/rc-shell";
import { RcButton } from "./ui/rc-button";
import { RcField, rcControlClass } from "./ui/rc-field";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80";

// Copied verbatim (hard rule: no cross-theme imports).
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
      <RcShell>
        <div className="flex min-h-[50vh] items-center justify-center font-[family-name:var(--font-rc-display)] text-sm uppercase tracking-[0.3em] text-[#8C8C8C]">
          Cargando…
        </div>
      </RcShell>
    );
  }

  if (notFound || !car) {
    return (
      <RcShell>
        <div className="mx-auto max-w-2xl px-6 py-32 sm:px-12">
          <div className="flex flex-col items-start gap-6 border border-[#FFFFFF14] p-12">
            <p className="font-[family-name:var(--font-rc-display)] text-2xl font-light uppercase tracking-[0.12em] text-[#E8E8E8]">
              No encontramos esta pieza
            </p>
            <p className="text-sm text-[#8C8C8C]">
              Puede que se haya adjudicado o que el enlace esté vencido.
            </p>
            <RcButton href="/inventory" variant="outline">
              Volver a la colección
            </RcButton>
          </div>
        </div>
      </RcShell>
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
    <RcShell>
      <article className="mx-auto max-w-5xl px-6 py-16 sm:px-12">
        <RcButton href="/inventory" variant="outline">
          Colección
        </RcButton>

        {/* Editorial image spread */}
        <div className="mt-12">
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#FFFFFF14] bg-[#0A0A0A]">
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
                      ? "border-[#E8E8E8]"
                      : "border-[#FFFFFF14] opacity-50 hover:opacity-100"
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
        <div className="mt-16 grid grid-cols-1 gap-12 border-b border-[#FFFFFF14] pb-14 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.4em] text-[#8C8C8C]">
              {car.make} · {car.bodyStyle || "Automóvil"}
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-rc-display)] text-4xl font-light uppercase leading-[1.1] tracking-[0.12em] text-[#E8E8E8] sm:text-5xl">
              {car.title}
            </h1>
          </div>

          <div>
            <span className="block font-[family-name:var(--font-rc-display)] text-3xl font-light tabular-nums tracking-[0.06em] text-[#E8E8E8]">
              {car.price}
            </span>
            {monthly !== null && downPayment !== null && (
              <dl className="mt-5 flex flex-col gap-2 border-t border-[#FFFFFF14] pt-5 text-xs text-[#8C8C8C]">
                <div className="flex justify-between">
                  <dt>Cuota estimada</dt>
                  <dd className="tabular-nums text-[var(--rc-accent)]">
                    ${Math.round(monthly).toLocaleString("en-US")}/mes
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Entrega inicial</dt>
                  <dd className="tabular-nums">
                    ${Math.round(downPayment).toLocaleString("en-US")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Plan</dt>
                  <dd className="tabular-nums">
                    {ESTIMATE_TERM_MONTHS} meses · TNA {ESTIMATE_APR.toFixed(1)}%
                  </dd>
                </div>
              </dl>
            )}
            <RcButton href="#consulta" className="mt-8 w-full">
              Consultar
            </RcButton>
          </div>
        </div>

        {/* Spec list */}
        <div className="mt-16">
          <h2 className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.4em] text-[#8C8C8C]">
            Ficha
          </h2>
          <dl className="mt-8 border-t border-[#FFFFFF14]">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between border-b border-[#FFFFFF14] py-5"
              >
                <dt className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.24em] text-[#8C8C8C]">
                  {spec.label}
                </dt>
                <dd className="text-sm text-[#E8E8E8]">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-16">
            <h2 className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.4em] text-[#8C8C8C]">
              Nota de curaduría
            </h2>
            <p className="mt-8 max-w-2xl whitespace-pre-line text-base font-light leading-relaxed text-[#8C8C8C]">
              {car.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-16">
          <h2 className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.4em] text-[#8C8C8C]">
            Equipamiento
          </h2>
          <ul className="mt-8 border-t border-[#FFFFFF14]">
            {features.map((feature, i) => (
              <li
                key={feature + i}
                className="border-b border-[#FFFFFF14] py-4 text-sm text-[#8C8C8C]"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Inquiry form */}
        <div id="consulta" className="mt-20 border-t border-[#FFFFFF29] pt-14">
          <h2 className="font-[family-name:var(--font-rc-display)] text-3xl font-light uppercase tracking-[0.15em] text-[#E8E8E8]">
            Consulte por esta pieza
          </h2>
          <p className="mt-5 text-sm text-[#8C8C8C]">
            Le responde un asesor de {settings.dealershipName} dentro de un día hábil.
          </p>

          {leadForm.success ? (
            <div className="mt-12 border border-[#FFFFFF29] p-10">
              <h3 className="font-[family-name:var(--font-rc-display)] text-lg font-light uppercase tracking-[0.15em] text-[#E8E8E8]">
                Consulta recibida
              </h3>
              <p className="mt-4 text-sm text-[#8C8C8C]">
                Un asesor de {settings.dealershipName} se comunica a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => leadForm.reset()}
                className="mt-8 rounded-none border border-[#FFFFFF33] px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#E8E8E8] transition-colors hover:border-[#E8E8E8]"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                <RcField label="Nombre completo">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={rcControlClass}
                  />
                </RcField>
                <RcField label="Teléfono">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={rcControlClass}
                  />
                </RcField>
              </div>

              <RcField label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={rcControlClass}
                />
              </RcField>

              <RcField label="Mensaje">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={rcControlClass}
                />
              </RcField>

              {leadForm.error && <p className="text-sm text-[#C77]">{leadForm.error}</p>}

              <div className="flex flex-col gap-4 sm:flex-row">
                <RcButton type="submit" disabled={leadForm.submitting}>
                  {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
                </RcButton>
                <RcButton href={whatsappUrl} external variant="outline">
                  Consultar por WhatsApp
                </RcButton>
              </div>
            </form>
          )}
        </div>
      </article>
    </RcShell>
  );
}
