"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { estimateListingPayment } from "@/lib/finance";
import type { VehicleDetailProps } from "@/components/themes/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80";

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

  const [activeImage, setActiveImage] = useState(0);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  // Lead form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (car) {
      setMessage(
        `Hola, estoy viendo la nota editorial sobre el ${car.title} (${car.price}). ¿Sigue disponible?`
      );
    }
  }, [car]);

  async function handleLeadSubmit(e: FormEvent) {
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
      <div className="flex min-h-screen items-center justify-center bg-[#FBFBFD] font-sans text-xs uppercase tracking-widest text-slate-400">
        Compilando archivo editorial…
      </div>
    );
  }

  if (notFound || !car) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-[#FBFBFD] font-sans">
        <p className="font-serif text-sm italic text-slate-800">
          No encontramos este ejemplar en nuestro archivo.
        </p>
        <Link
          href="/inventory"
          className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:underline"
        >
          &larr; Volver al showroom
        </Link>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [car.img || FALLBACK_IMAGE];
  const carFeatures = car.features && car.features.length > 0 ? car.features : DEFAULT_FEATURES;

  // car.price is a pre-formatted display string ("$28,995") — parse it back
  // to a number just to drive the "starting at" monthly estimate, same
  // financing assumptions used on the homepage's featured cards.
  const numericPrice = parseInt(car.price.replace(/[^0-9]/g, ""), 10);
  const monthlyEstimate = Number.isFinite(numericPrice) && numericPrice > 0 ? estimateListingPayment(numericPrice) : null;
  const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, message);

  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-32 font-sans text-[#1D1D1F] selection:bg-blue-500 selection:text-white">
      {/* Magazine navigation header */}
      <header className="sticky top-0 z-40 border-b border-[#D2D2D7]/40 bg-[#FBFBFD]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/inventory" className="text-xs font-bold uppercase tracking-widest text-slate-900">
            OXIS<span className="text-blue-600">.</span>{" "}
            <span className="font-serif text-sm font-normal italic lowercase text-slate-500">magazine</span>
          </Link>
          <div className="flex items-center gap-6 text-xs font-semibold">
            <Link
              href="/inventory"
              className="text-[11px] uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-900"
            >
              Índice
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 pt-16 sm:pt-24">
        {/* Issue metadata header */}
        <div className="mx-auto mb-16 max-w-2xl space-y-6 text-center">
          <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <span>Prueba N.º {car.id.slice(0, 4).toUpperCase()}</span>
            <span>&bull;</span>
            <span>{car.make}</span>
            <span>&bull;</span>
            <span>{car.year}</span>
          </div>

          <h1 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-[#1D1D1F] sm:text-6xl">
            {car.title}
          </h1>

          <div className="pt-3">
            {monthlyEstimate ? (
              <>
                <div className="font-mono text-4xl font-bold tracking-tight text-blue-600 sm:text-5xl">
                  ${Math.round(monthlyEstimate).toLocaleString("en-US")}
                  <span className="text-lg font-medium text-slate-400">/mes*</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">o {car.price} de contado</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  *Cuota estimada con 30% de anticipo, TNA 6,9% a 60 meses, sujeto a aprobación
                  crediticia.
                </p>
              </>
            ) : (
              <span className="font-mono text-4xl font-bold tracking-tight text-blue-600 sm:text-5xl">
                {car.price}
              </span>
            )}
          </div>
        </div>

        {/* Hero spread slideshow */}
        <div className="mb-20 space-y-4">
          <div className="relative h-[450px] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 shadow-2xl sm:h-[620px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
            <img
              src={images[activeImage]}
              alt={car.title}
              className="h-full w-full object-cover object-center transition-all duration-700 ease-out"
            />
            <div className="absolute bottom-4 left-4 rounded-lg bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-md">
              Toma {activeImage + 1} de {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <div className="scrollbar-none flex gap-3 overflow-x-auto pb-3 pt-1">
              {images.map((imgUrl, idx) => (
                <button
                  key={imgUrl + idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImage === idx
                      ? "scale-95 border-blue-600 opacity-100 shadow-md ring-2 ring-blue-500/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of an arbitrary URL */}
                  <img src={imgUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spec ticker */}
        <div className="mb-20 grid grid-cols-2 gap-8 border-y border-[#D2D2D7]/60 py-10 text-center font-mono sm:grid-cols-4">
          <Stat label="Año" value={String(car.year)} />
          <Stat label="Kilometraje" value={car.mileage || "—"} />
          <Stat label="Tracción" value={car.drivetrain || "—"} />
          <Stat label="Transmisión" value={car.transmission || "—"} />
        </div>

        {/* Editorial essay */}
        <div className="mx-auto mb-20 max-w-2xl space-y-8 font-serif text-lg leading-relaxed text-slate-800">
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-400">
            Prueba de manejo y evaluación
          </h3>
          <p className="first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:font-bold first-letter:text-blue-600">
            {car.description
              ? car.description.split("\n")[0]
              : `El ${car.title} representa una clase magistral de ingeniería automotriz moderna. Con especificación de fábrica, este ejemplar combina una conducción diaria refinada con una presencia de calle incuestionable.`}
          </p>
          {car.description && car.description.split("\n").length > 1 && (
            <p className="font-sans text-sm font-normal leading-relaxed text-slate-600">
              {car.description.split("\n").slice(1).join(" ")}
            </p>
          )}
          <p className="font-sans text-sm font-normal leading-relaxed text-slate-600">
            Cada vehículo del archivo OXIS pasa por una evaluación estructural y mecánica de 150 puntos.
            Integridad de pintura, diagnóstico de módulos electrónicos y tolerancias térmicas deben cumplir
            estrictamente con los estándares de fábrica antes de ingresar al catálogo.
          </p>
        </div>

        {/* Features ledger */}
        <div className="mx-auto mb-24 max-w-2xl overflow-hidden rounded-2xl border border-[#D2D2D7]/60 bg-white shadow-xs">
          <button
            type="button"
            onClick={() => setFeaturesOpen((v) => !v)}
            className="flex w-full items-center justify-between bg-slate-50/60 px-6 py-5 text-left transition-colors hover:bg-slate-100/50"
          >
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                Equipamiento de fábrica
              </h4>
              <p className="mt-0.5 font-sans text-[11px] text-slate-500">
                {carFeatures.length} especificaciones verificadas
              </p>
            </div>
            <span
              className={`text-xs font-bold text-slate-600 transition-transform duration-300 ${featuresOpen ? "rotate-180" : ""}`}
            >
              &darr; Ver todo
            </span>
          </button>

          {featuresOpen && (
            <div className="grid grid-cols-1 gap-3 border-t border-[#D2D2D7]/60 bg-white p-6 sm:grid-cols-2">
              {carFeatures.map((feature, idx) => (
                <div
                  key={feature + idx}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-[#FBFBFD] p-3.5 font-sans text-xs font-medium text-slate-800"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inquiry form */}
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#D2D2D7]/60 bg-white p-8 shadow-xl sm:p-14">
          <div className="mb-8 space-y-1 text-center">
            <h3 className="font-serif text-2xl font-normal text-[#1D1D1F]">Iniciar consulta de compra</h3>
            <p className="font-sans text-xs text-slate-500">
              Contactá a nuestro equipo de ventas o abrí un canal directo por WhatsApp.
            </p>
          </div>

          {leadForm.success ? (
            <div className="space-y-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-800">
                Consulta registrada
              </h4>
              <p className="font-sans text-xs text-emerald-700">
                Tu consulta llegó al pipeline del equipo. Un asesor se va a contactar a la brevedad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4 font-sans">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Tu nombre"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+598 99 123 456"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {leadForm.error && <p className="text-xs text-red-600">{leadForm.error}</p>}

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={leadForm.submitting}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 disabled:opacity-50"
                >
                  {leadForm.submitting ? "Enviando…" : "Enviar al equipo"}
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </article>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <span className="mt-1.5 block text-base font-semibold text-[#1D1D1F]">{value}</span>
    </div>
  );
}
