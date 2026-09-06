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
import { GvShell } from "./ui/gv-shell";
import { GvButton } from "./ui/gv-button";
import { GvField, gvControlClass } from "./ui/gv-field";

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
      setMessage(
        `Hola, estoy viendo el ${car.title} (${car.price}) de la Colección Villasuso. ¿Sigue disponible?`
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
      <GvShell>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-white/50">
          Cargando…
        </div>
      </GvShell>
    );
  }

  if (notFound || !car) {
    return (
      <GvShell>
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 border border-white/15 bg-[#0B0B0C] p-8">
            <span className="inline-block h-2 w-8 bg-[var(--gv-accent)]" />
            <p className="font-[family-name:var(--font-gv-display)] text-lg font-semibold uppercase tracking-wide text-white">
              No encontramos esta unidad
            </p>
            <p className="text-sm text-white/55">
              Puede que se haya vendido o que el enlace esté vencido.
            </p>
            <GvButton href="/inventory" variant="outline">
              Volver al inventario
            </GvButton>
          </div>
        </div>
      </GvShell>
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
    <GvShell>
      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <GvButton href="/inventory" variant="outline" className="!px-3.5 !py-2 !text-[11px]">
          ← Inventario
        </GvButton>

        {/* Gallery */}
        <div className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-white/20 bg-[#0B0B0C]">
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
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-none border transition-colors ${
                    activeImage === i
                      ? "border-[var(--gv-accent)]"
                      : "border-white/20 opacity-60 hover:opacity-100"
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
        <div className="mt-8 grid grid-cols-1 gap-6 border-b border-white/15 pb-8 lg:grid-cols-[1fr_320px]">
          <div>
            <span className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C8CBD0]">
              {car.make} · {car.bodyStyle}
            </span>
            <h1 className="mt-2 font-[family-name:var(--font-gv-display)] text-3xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-4xl">
              {car.title}
            </h1>
            <span className="mt-4 inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 font-[family-name:var(--font-gv-display)] text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              <span aria-hidden className="inline-block h-1.5 w-5 bg-[var(--gv-accent)]" />
              Verificada
            </span>
          </div>

          <div className="border border-white/15 bg-[#0B0B0C] p-5">
            <span className="block font-[family-name:var(--font-gv-display)] text-2xl font-bold text-white">
              {car.price}
            </span>
            {monthly !== null && downPayment !== null && (
              <dl className="mt-3 flex flex-col gap-1.5 border-t border-white/10 pt-3 text-xs text-white/60">
                <div className="flex justify-between">
                  <dt>Cuota estimada</dt>
                  <dd className="font-semibold text-[var(--gv-accent)]">
                    ${Math.round(monthly).toLocaleString("en-US")}/mes
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Entrega inicial</dt>
                  <dd className="text-white">
                    ${Math.round(downPayment).toLocaleString("en-US")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Plan</dt>
                  <dd className="text-white">
                    {ESTIMATE_TERM_MONTHS} meses · TNA {ESTIMATE_APR.toFixed(1)}%
                  </dd>
                </div>
              </dl>
            )}
            <GvButton href="#consulta" className="mt-4 w-full">
              Consultar
            </GvButton>
          </div>
        </div>

        {/* Engineering spec table */}
        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
            Ficha técnica
          </h2>
          <dl className="mt-3 grid grid-cols-1 gap-px border border-white/15 bg-white/15 sm:grid-cols-2">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between bg-black px-4 py-3.5 text-sm"
              >
                <dt className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8CBD0]">
                  {spec.label}
                </dt>
                <dd className="font-medium text-white">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Verification mark */}
        <div className="mt-8 flex items-start gap-4 border border-white/15 bg-[#0B0B0C] p-6">
          <span aria-hidden className="mt-1 inline-block h-2 w-10 shrink-0 bg-[var(--gv-accent)]" />
          <div>
            <h2 className="font-[family-name:var(--font-gv-display)] text-base font-semibold uppercase tracking-wide text-white">
              Cada unidad, verificada
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Mecánica, carrocería, electrónica, neumáticos y documentación revisados por
              técnicos certificados. Rendimiento con procedencia — el informe completo se
              entrega con la unidad.
            </p>
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-8">
            <h2 className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Descripción
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/65">
              {car.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
            Equipamiento
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {features.map((feature, i) => (
              <li
                key={feature + i}
                className="flex items-center gap-3 border border-white/15 bg-[#0B0B0C] px-3 py-2.5 text-sm text-white/65"
              >
                <span aria-hidden className="inline-block h-1.5 w-4 shrink-0 bg-[var(--gv-accent)]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Inquiry form */}
        <div id="consulta" className="mt-10 border border-white/15 bg-[#0B0B0C] p-6">
          <h2 className="font-[family-name:var(--font-gv-display)] text-xl font-bold uppercase tracking-tight text-white">
            Consultá por esta unidad
          </h2>
          <p className="mt-2 text-sm text-white/55">
            Te responde un asesor de {settings.dealershipName} dentro de un día hábil.
          </p>

          {leadForm.success ? (
            <div className="mt-6 border border-white/15 bg-black p-6">
              <span className="inline-block h-2 w-8 bg-[var(--gv-accent)]" />
              <h3 className="mt-3 font-[family-name:var(--font-gv-display)] text-base font-semibold uppercase tracking-wide text-white">
                Consulta enviada
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Un asesor de {settings.dealershipName} se comunica a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => leadForm.reset()}
                className="mt-4 rounded-none border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-white"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <GvField label="Nombre completo">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={gvControlClass}
                  />
                </GvField>
                <GvField label="Teléfono">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={gvControlClass}
                  />
                </GvField>
              </div>

              <GvField label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={gvControlClass}
                />
              </GvField>

              <GvField label="Mensaje">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={gvControlClass}
                />
              </GvField>

              {leadForm.error && (
                <p className="text-sm font-medium text-[var(--gv-accent)]">{leadForm.error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <GvButton type="submit" disabled={leadForm.submitting}>
                  {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
                </GvButton>
                <GvButton href={whatsappUrl} external variant="outline">
                  Consultar por WhatsApp
                </GvButton>
              </div>
            </form>
          )}
        </div>
      </article>
    </GvShell>
  );
}
