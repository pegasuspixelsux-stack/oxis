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
import { CarmaxShell } from "./ui/carmax-shell";
import { CarmaxButton } from "./ui/carmax-button";
import { CarmaxField, carmaxControlClass } from "./ui/carmax-field";

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
      <CarmaxShell>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#16202A]/55">
          Cargando…
        </div>
      </CarmaxShell>
    );
  }

  if (notFound || !car) {
    return (
      <CarmaxShell>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-3 border border-[#16202A]/12 bg-white p-6">
            <p className="text-base font-semibold">No encontramos este vehículo</p>
            <p className="text-sm text-[#16202A]/60">
              Puede que se haya vendido o que el enlace esté vencido.
            </p>
            <CarmaxButton href="/inventory" variant="outline">
              Volver al inventario
            </CarmaxButton>
          </div>
        </div>
      </CarmaxShell>
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
    <CarmaxShell>
      <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <CarmaxButton href="/inventory" variant="outline" className="!px-3 !py-1.5 !text-xs">
          ← Volver a la búsqueda
        </CarmaxButton>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#16202A]/12 bg-[#F4F5F7]">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
              <img
                src={images[activeImage]}
                alt={car.title}
                className="h-full w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-none border-2 transition-colors ${
                      activeImage === i
                        ? "border-[var(--carmax-accent)]"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of an arbitrary URL */}
                    <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Spec table */}
            <div className="mt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/55">
                Ficha técnica
              </h2>
              <dl className="mt-2 grid grid-cols-1 gap-px border border-[#16202A]/12 bg-[#16202A]/12 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between bg-white px-3 py-2.5 text-sm"
                  >
                    <dt className="text-[#16202A]/55">{spec.label}</dt>
                    <dd className="font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {car.description && (
              <div className="mt-6">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/55">
                  Descripción
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#16202A]/70">
                  {car.description}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="mt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/55">
                Equipamiento
              </h2>
              <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {features.map((feature, i) => (
                  <li
                    key={feature + i}
                    className="flex items-center gap-2 border border-[#16202A]/12 bg-white px-3 py-2 text-sm text-[#16202A]/70"
                  >
                    <span aria-hidden className="text-[var(--carmax-accent)]">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar: price + finance + inquiry */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
            <div className="border border-[#16202A]/12 bg-white p-5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--carmax-accent)]">
                {car.make} · {car.bodyStyle}
              </span>
              <h1 className="mt-1 text-lg font-bold leading-snug tracking-tight">{car.title}</h1>
              <span className="mt-3 block font-[family-name:var(--font-carmax-mono)] text-2xl font-semibold">
                {car.price}
              </span>
              {monthly !== null && downPayment !== null && (
                <dl className="mt-3 flex flex-col gap-1.5 border-t border-[#16202A]/12 pt-3 font-[family-name:var(--font-carmax-mono)] text-[11px] text-[#16202A]/60">
                  <div className="flex justify-between">
                    <dt>Cuota estimada</dt>
                    <dd className="font-semibold text-[var(--carmax-accent)]">
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
            </div>

            <div className="border border-[#16202A]/12 bg-white p-5">
              <h2 className="text-base font-bold">Consultá por este vehículo</h2>
              <p className="mt-1 text-sm text-[#16202A]/60">
                Te responde un asesor de {settings.dealershipName}.
              </p>

              {leadForm.success ? (
                <div className="mt-4 border border-[var(--carmax-accent)]/40 bg-[var(--carmax-accent)]/5 p-4">
                  <h3 className="text-sm font-semibold">Consulta enviada</h3>
                  <p className="mt-1 text-sm text-[#16202A]/65">
                    Un asesor de {settings.dealershipName} se comunica a la brevedad.
                  </p>
                  <button
                    type="button"
                    onClick={() => leadForm.reset()}
                    className="mt-3 rounded-none border border-[#16202A]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#16202A] transition-colors hover:border-[var(--carmax-accent)]"
                  >
                    Enviar otra
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                  <CarmaxField label="Nombre completo">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={carmaxControlClass}
                    />
                  </CarmaxField>
                  <CarmaxField label="Teléfono">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={carmaxControlClass}
                    />
                  </CarmaxField>
                  <CarmaxField label="Correo electrónico">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={carmaxControlClass}
                    />
                  </CarmaxField>
                  <CarmaxField label="Mensaje">
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className={carmaxControlClass}
                    />
                  </CarmaxField>

                  {leadForm.error && (
                    <p className="text-sm font-medium text-[#B42318]">{leadForm.error}</p>
                  )}

                  <div className="flex flex-col gap-2">
                    <CarmaxButton type="submit" disabled={leadForm.submitting}>
                      {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
                    </CarmaxButton>
                    <CarmaxButton href={whatsappUrl} external variant="outline">
                      Consultar por WhatsApp
                    </CarmaxButton>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </article>
    </CarmaxShell>
  );
}
