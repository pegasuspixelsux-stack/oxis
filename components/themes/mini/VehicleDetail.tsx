"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { estimateListingPayment } from "@/lib/finance";
import type { VehicleDetailProps } from "@/components/themes/types";
import { MiniShell } from "./ui/mini-shell";
import { MiniButton } from "./ui/mini-button";
import { MiniField, miniControlClass } from "./ui/mini-field";

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
  const { logoText } = resolveThemeSettings(settings, "mini");

  const [activeImage, setActiveImage] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (car) {
      setMessage(
        `Hola, estoy viendo el ${car.title} (${car.price}). ¿Sigue disponible?`
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
      <MiniShell>
        <div className="flex min-h-[50vh] items-center justify-center text-sm font-extrabold uppercase tracking-widest text-neutral-500">
          Cargando…
        </div>
      </MiniShell>
    );
  }

  if (notFound || !car) {
    return (
      <MiniShell>
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-5 border-2 border-neutral-950 p-10">
            <p className="text-xl font-extrabold uppercase tracking-tight">
              No encontramos este vehículo
            </p>
            <p className="text-sm text-neutral-600">
              Puede que se haya vendido o que el enlace esté vencido.
            </p>
            <MiniButton href="/inventory" variant="outline">
              Volver al inventario
            </MiniButton>
          </div>
        </div>
      </MiniShell>
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
    <MiniShell>
      <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <MiniButton href="/inventory" variant="outline" className="!px-4 !py-2 !text-xs">
          ← Inventario
        </MiniButton>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-neutral-950 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
              <img
                src={images[activeImage]}
                alt={car.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-3 top-3 border-2 border-neutral-950 bg-white px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide">
                {activeImage + 1} / {images.length}
              </span>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-28 shrink-0 overflow-hidden border-2 transition-colors ${
                      activeImage === i
                        ? "border-[var(--mini-accent)]"
                        : "border-neutral-950 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of an arbitrary URL */}
                    <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--mini-accent)]">
                {car.make} · {car.bodyStyle}
              </span>
              <h1 className="mt-1 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter sm:text-4xl">
                {car.title}
              </h1>
            </div>

            <div className="border-2 border-neutral-950 bg-neutral-950 p-6 text-white">
              <span className="text-3xl font-extrabold tracking-tight">{car.price}</span>
              {monthly && (
                <p className="mt-2 border-t-2 border-neutral-800 pt-3 text-sm text-neutral-300">
                  Desde{" "}
                  <span className="font-extrabold text-[var(--mini-accent)]">
                    ${Math.round(monthly).toLocaleString("en-US")}/mes
                  </span>{" "}
                  con 30% de anticipo, TNA 6,9% a 60 meses. Sujeto a aprobación crediticia.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-0.5 border-2 border-neutral-950 bg-neutral-950">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-white p-5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-500">
                    {spec.label}
                  </span>
                  <p className="mt-1 text-lg font-extrabold uppercase tracking-tight">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            <MiniButton href={whatsappUrl} external>
              Consultar por WhatsApp
            </MiniButton>
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-14 max-w-3xl">
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-500">
              Descripción
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {car.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-14">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-500">
            Equipamiento
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-0.5 border-2 border-neutral-950 bg-neutral-950 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature + i}
                className="flex items-center gap-3 bg-white p-4 text-sm font-bold uppercase tracking-wide"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--mini-accent)]" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Inquiry form */}
        <div className="mt-14 max-w-3xl">
          <h2 className="text-3xl font-extrabold uppercase tracking-tighter sm:text-4xl">
            Consultar por este vehículo
          </h2>

          {leadForm.success ? (
            <div className="mt-8 border-2 border-neutral-950 bg-[var(--mini-accent)] p-8 text-white">
              <h3 className="text-lg font-extrabold uppercase tracking-wide">Consulta enviada</h3>
              <p className="mt-2 text-sm">
                Un asesor de {logoText} se comunica a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => leadForm.reset()}
                className="mt-5 border-2 border-white px-4 py-2 text-xs font-extrabold uppercase tracking-widest transition-colors hover:bg-white hover:text-[var(--mini-accent)]"
              >
                Enviar otra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <MiniField label="Nombre completo">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={miniControlClass}
                  />
                </MiniField>
                <MiniField label="Teléfono">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={miniControlClass}
                  />
                </MiniField>
              </div>

              <MiniField label="Correo electrónico">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={miniControlClass}
                />
              </MiniField>

              <MiniField label="Mensaje">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={miniControlClass}
                />
              </MiniField>

              {leadForm.error && (
                <p className="text-sm font-bold text-[var(--mini-accent)]">{leadForm.error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <MiniButton type="submit" disabled={leadForm.submitting}>
                  {leadForm.submitting ? "Enviando…" : "Enviar al equipo"}
                </MiniButton>
                <MiniButton href={whatsappUrl} external variant="outline">
                  WhatsApp
                </MiniButton>
              </div>
            </form>
          )}
        </div>
      </article>
    </MiniShell>
  );
}
