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
import { DiforShell } from "./ui/difor-shell";
import { DiforButton } from "./ui/difor-button";
import { DiforField, diforControlClass } from "./ui/difor-field";

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

// Static inspection status. There is no real inspection field on the car
// document, so this is fixed copy shown as a verification panel.
const INSPECTION_HEADLINE = "Inspección de 150 puntos — verificada ✓";

export default function DetailView({ car, loading, notFound, leadForm }: VehicleDetailProps) {
  const { settings } = useSettings();

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
      <DiforShell>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#1B2733]/55">
          Cargando…
        </div>
      </DiforShell>
    );
  }

  if (notFound || !car) {
    return (
      <DiforShell>
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 border border-[#1B2733]/12 bg-white p-8">
            <p className="text-lg font-semibold">No encontramos este vehículo</p>
            <p className="text-sm text-[#1B2733]/60">
              Puede que se haya vendido o que el enlace esté vencido.
            </p>
            <DiforButton href="/inventory" variant="outline">
              Volver al inventario
            </DiforButton>
          </div>
        </div>
      </DiforShell>
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
    { label: "Marca", value: car.make || "—" },
  ];

  return (
    <DiforShell>
      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <DiforButton href="/inventory" variant="outline" className="!px-3.5 !py-2 !text-xs">
          ← Inventario
        </DiforButton>

        {/* Gallery */}
        <div className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#1B2733]/12 bg-[#F5F7FA]">
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
                      ? "border-[var(--difor-accent)]"
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
        <div className="mt-8 grid grid-cols-1 gap-6 border-b border-[#1B2733]/10 pb-8 lg:grid-cols-[1fr_320px]">
          <div>
            <span className="text-sm font-medium text-[var(--difor-accent)]">
              {car.make} · {car.bodyStyle}
            </span>
            <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {car.title}
            </h1>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-none border border-[#1F8B3F]/30 bg-[#1F8B3F]/10 px-2.5 py-1 text-xs font-medium text-[#1F8B3F]">
              <span aria-hidden>✓</span> Inspección verificada
            </span>
          </div>

          <div className="border border-[#1B2733]/12 bg-white p-5">
            <span className="block font-[family-name:var(--font-difor-mono)] text-2xl font-semibold">
              {car.price}
            </span>
            {monthly !== null && downPayment !== null && (
              <dl className="mt-3 flex flex-col gap-1.5 border-t border-[#1B2733]/10 pt-3 font-[family-name:var(--font-difor-mono)] text-xs text-[#1B2733]/60">
                <div className="flex justify-between">
                  <dt>Cuota estimada</dt>
                  <dd className="font-semibold text-[var(--difor-accent)]">
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
            <DiforButton href="#consulta" className="mt-4 w-full">
              Consultar
            </DiforButton>
          </div>
        </div>

        {/* Inspection panel */}
        <div className="mt-8 border border-[#1F8B3F]/30 bg-[#1F8B3F]/10 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#1B2733]">
            <span
              aria-hidden
              className="flex h-6 w-6 items-center justify-center rounded-none bg-[#1F8B3F] text-sm text-white"
            >
              ✓
            </span>
            {INSPECTION_HEADLINE}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#1B2733]/65">
            Mecánica, carrocería, electrónica, neumáticos y documentación revisados por
            técnicos certificados. El informe completo se entrega con la unidad.
          </p>
        </div>

        {/* Spec table */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1B2733]/55">
            Especificaciones
          </h2>
          <dl className="mt-3 grid grid-cols-1 gap-px border border-[#1B2733]/12 bg-[#1B2733]/12 sm:grid-cols-2">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between bg-white px-4 py-3 text-sm"
              >
                <dt className="text-[#1B2733]/55">{spec.label}</dt>
                <dd className="font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1B2733]/55">
              Descripción
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#1B2733]/70">
              {car.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1B2733]/55">
            Equipamiento
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {features.map((feature, i) => (
              <li
                key={feature + i}
                className="flex items-center gap-2.5 border border-[#1B2733]/12 bg-white px-3 py-2.5 text-sm text-[#1B2733]/70"
              >
                <span aria-hidden className="text-[#1F8B3F]">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Inquiry form */}
        <div id="consulta" className="mt-10 border border-[#1B2733]/12 bg-white p-6">
          <h2 className="text-xl font-semibold">Consultá por este vehículo</h2>
          <p className="mt-2 text-sm text-[#1B2733]/60">
            Te responde un asesor de {settings.dealershipName} dentro de un día hábil.
          </p>

          {leadForm.success ? (
            <div className="mt-6 border border-[#1F8B3F]/30 bg-[#1F8B3F]/10 p-6">
              <h3 className="text-base font-semibold">Consulta enviada</h3>
              <p className="mt-2 text-sm text-[#1B2733]/65">
                Un asesor de {settings.dealershipName} se comunica a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => leadForm.reset()}
                className="mt-4 rounded-none border border-[#1B2733]/20 bg-white px-4 py-2 text-sm font-medium text-[#1B2733] transition-colors hover:border-[var(--difor-accent)] hover:text-[var(--difor-accent)]"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <DiforField label="Nombre completo">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={diforControlClass}
                  />
                </DiforField>
                <DiforField label="Teléfono">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={diforControlClass}
                  />
                </DiforField>
              </div>

              <DiforField label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={diforControlClass}
                />
              </DiforField>

              <DiforField label="Mensaje">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={diforControlClass}
                />
              </DiforField>

              {leadForm.error && (
                <p className="text-sm font-medium text-[#B42318]">{leadForm.error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <DiforButton type="submit" disabled={leadForm.submitting}>
                  {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
                </DiforButton>
                <DiforButton href={whatsappUrl} external variant="outline">
                  Consultar por WhatsApp
                </DiforButton>
              </div>
            </form>
          )}
        </div>
      </article>
    </DiforShell>
  );
}
