"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useSettings } from "@/components/settings-provider";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment, estimateListingPayment } from "@/lib/finance";
import { ArrowRightIcon } from "@/components/icons";
import type { HomeProps } from "@/components/themes/types";
import { BydShell } from "./ui/byd-shell";
import { BydButton } from "./ui/byd-button";
import { BydField, bydControlClass } from "./ui/byd-field";

// Copied verbatim from BMW's intro-section copy (hard rule: no imports
// across theme folders). byd reframes these as a clean-tech spec-callout
// band, so only the text is kept.
const GUARANTEES = [
  {
    title: "Inspección de 150 puntos",
    description:
      "Cada vehículo es desarmado por técnicos certificados y revisado de punta a punta antes de llegar al showroom.",
  },
  {
    title: "Garantía de devolución de 7 días",
    description:
      "Manejalo una semana. Si no es lo que esperabas, lo devolvés y te reintegramos todo — sin costo de reposición ni letra chica.",
  },
  {
    title: "Precios transparentes, sin regateo",
    description:
      "El precio en el cartel es el precio que pagás. Publicamos nuestro análisis de mercado para que lo verifiques vos mismo.",
  },
  {
    title: "Informe de historial gratuito",
    description:
      "Cada publicación incluye un informe de historial completo sin costo — siniestros, estado de título y service incluidos.",
  },
];

const TECH_CALLOUTS = [
  { value: "100%", label: "Conectividad total a bordo" },
  { value: "24/7", label: "Asistencias de conducción" },
  { value: "0", label: "Fricción en la compra" },
];

const CONTACT_METHODS = ["WhatsApp", "Teléfono", "Email"] as const;

const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80";

function listingMonthly(price: string): number | null {
  const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return estimateListingPayment(numeric);
}

export default function HomeHero({ loading, filterCars }: HomeProps) {
  const { settings } = useSettings();
  const featured = filterCars({}).slice(0, 6);

  return (
    <BydShell>
      <Hero heroImage={settings.heroBannerImageUrl} dealershipName={settings.dealershipName} />
      <SpecCalloutBand />
      <CollectionGrid cars={featured} loading={loading} />
      <FinanceBlock />
      <ContactBlock />
    </BydShell>
  );
}

function Hero({ heroImage, dealershipName }: { heroImage: string; dealershipName: string }) {
  return (
    <section className="relative overflow-hidden border-b border-[#0A1A2F]/10 bg-gradient-to-b from-white via-white to-[#F1F4F7]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="flex items-center gap-2 font-[family-name:var(--font-byd-display)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--byd-accent)]">
            <span className="inline-block h-1.5 w-8 bg-gradient-to-r from-[var(--byd-accent)] to-[#00B4D8]" />
            Movilidad eléctrica
          </p>
          <h1 className="mt-6 font-[family-name:var(--font-byd-display)] text-5xl font-bold leading-[1.03] tracking-tighter sm:text-6xl">
            Tecnología que se maneja sola
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#1E2A38]/65">
            Cada ficha, transparente. Especificaciones reales, cuota calculada y una compra sin
            fricción. El futuro se prueba manejando.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <BydButton href="#coleccion">
              Ver la colección
              <ArrowRightIcon className="h-4 w-4" />
            </BydButton>
            <BydButton href="#rendimiento" variant="outline">
              Rendimiento y eficiencia
            </BydButton>
          </div>
        </div>

        <div className="relative aspect-square w-full border border-[var(--byd-accent)]/30 bg-[#E8ECF1]">
          <span className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[var(--byd-accent)] to-[#00B4D8]" />
          <Image
            src={heroImage}
            alt={`Showroom de ${dealershipName}`}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function SpecCalloutBand() {
  return (
    <section className="border-b border-[#0A1A2F]/10 bg-[#F1F4F7]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-byd-display)] text-2xl font-bold tracking-tight sm:text-3xl">
          Cada ficha, transparente
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-px border border-[#0A1A2F]/10 bg-[#0A1A2F]/10 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((item, i) => (
            <div key={item.title} className="bg-white p-6">
              <span className="font-[family-name:var(--font-byd-display)] text-3xl font-bold text-[var(--byd-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#1E2A38]/60">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-px grid grid-cols-1 gap-px border border-t-0 border-[#0A1A2F]/10 bg-[#0A1A2F]/10 sm:grid-cols-3">
          {TECH_CALLOUTS.map((c) => (
            <div key={c.label} className="bg-white p-6">
              <span className="font-[family-name:var(--font-byd-display)] text-4xl font-bold tracking-tighter">
                {c.value}
              </span>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[#5A6B7D]">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecCard({ car }: { car: HomeProps["cars"][number] }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  const monthly = listingMonthly(car.price);

  return (
    <article className="flex flex-col border border-[#0A1A2F]/10 bg-white transition-colors hover:border-[var(--byd-accent)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E8ECF1]">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img src={image} alt={car.title} className="h-full w-full object-cover" />
        <span className="absolute left-0 top-0 bg-white/95 px-2.5 py-1 font-[family-name:var(--font-byd-display)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0A1A2F]">
          {car.make}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-sm font-semibold leading-snug">{car.title}</h3>
        <p className="mt-3 border-t border-[#0A1A2F]/10 pt-3 text-xs uppercase tracking-[0.12em] text-[#5A6B7D]">
          {car.year} · {car.mileage || "—"} · {car.drivetrain || "—"}
        </p>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="block font-[family-name:var(--font-byd-display)] text-lg font-bold">
              {car.price}
            </span>
            {monthly && (
              <span className="text-xs text-[var(--byd-accent)]">
                ${Math.round(monthly).toLocaleString("en-US")}/mes
              </span>
            )}
          </div>
          <BydButton
            href={`/inventory/${car.id}`}
            variant="outline"
            className="!px-3.5 !py-2 !text-xs"
          >
            Ver especificaciones
          </BydButton>
        </div>
      </div>
    </article>
  );
}

function CollectionGrid({ cars, loading }: { cars: HomeProps["cars"]; loading: boolean }) {
  return (
    <section id="coleccion" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#0A1A2F]/10 pb-6">
        <div>
          <h2 className="font-[family-name:var(--font-byd-display)] text-2xl font-bold tracking-tight sm:text-3xl">
            La colección
          </h2>
          <p className="mt-2 text-sm text-[#1E2A38]/60">
            Unidades verificadas, listas para probar. Especificaciones sin letra chica.
          </p>
        </div>
        <BydButton href="/inventory" variant="outline">
          Ver todo el inventario
        </BydButton>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-[#0A1A2F]/10 bg-white" aria-hidden>
                <div className="aspect-[16/10] animate-pulse bg-[#0A1A2F]/5" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse bg-[#0A1A2F]/5" />
                  <div className="h-3 w-full animate-pulse bg-[#0A1A2F]/5" />
                  <div className="h-6 w-24 animate-pulse bg-[#0A1A2F]/5" />
                </div>
              </div>
            ))
          : cars.map((car) => <SpecCard key={car.id} car={car} />)}
      </div>

      {!loading && cars.length === 0 && (
        <p className="mt-10 border border-[#0A1A2F]/10 bg-white p-6 text-sm text-[#1E2A38]/60">
          Todavía no hay vehículos publicados.
        </p>
      )}
    </section>
  );
}

function FinanceBlock() {
  const [price, setPrice] = useState(32000);
  const [downPayment, setDownPayment] = useState(9000);
  const [apr, setApr] = useState(6.9);
  const [term, setTerm] = useState(60);

  const principal = Math.max(0, price - downPayment);
  const monthly = monthlyPayment(principal, apr, term);
  const totalCost = monthly * term + downPayment;

  return (
    <section id="rendimiento" className="border-y border-[#0A1A2F]/10 bg-[#F1F4F7]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-byd-display)] text-2xl font-bold tracking-tight sm:text-3xl">
            Rendimiento y eficiencia
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#1E2A38]/60">
            Estimá tu cuota mensual antes de venir. Los valores son orientativos y quedan
            sujetos a aprobación crediticia.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px border border-[#0A1A2F]/10 bg-[#0A1A2F]/10 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-6 bg-white p-6 sm:p-8">
            <SliderRow
              label="Precio del vehículo"
              value={`$${price.toLocaleString("en-US")}`}
              min={10000}
              max={150000}
              step={1000}
              current={price}
              onChange={setPrice}
            />
            <SliderRow
              label="Entrega inicial"
              value={`$${Math.min(downPayment, price).toLocaleString("en-US")}`}
              min={0}
              max={Math.max(1000, price)}
              step={1000}
              current={Math.min(downPayment, price)}
              onChange={setDownPayment}
            />
            <SliderRow
              label="Tasa anual (TNA)"
              value={`${apr.toFixed(1)}%`}
              min={0}
              max={20}
              step={0.1}
              current={apr}
              onChange={setApr}
            />
            <SliderRow
              label="Plazo"
              value={`${term} meses`}
              min={12}
              max={84}
              step={12}
              current={term}
              onChange={setTerm}
            />
          </div>

          <div className="flex flex-col justify-center gap-1 bg-gradient-to-br from-[var(--byd-accent)] to-[#00B4D8] p-6 text-white sm:p-8">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">
              Cuota mensual estimada
            </span>
            <span className="font-[family-name:var(--font-byd-display)] text-5xl font-bold tracking-tighter">
              ${Math.round(monthly).toLocaleString("en-US")}
            </span>
            <dl className="mt-5 flex flex-col gap-2 border-t border-white/25 pt-4 text-xs text-white/85">
              <div className="flex justify-between">
                <dt>Monto a financiar</dt>
                <dd>${principal.toLocaleString("en-US")}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Plazo</dt>
                <dd>
                  {term} meses · TNA {apr.toFixed(1)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Costo total estimado</dt>
                <dd>${Math.round(totalCost).toLocaleString("en-US")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5A6B7D]">
          {label}
        </span>
        <span className="font-[family-name:var(--font-byd-display)] text-sm font-bold text-[var(--byd-accent)]">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--byd-accent)]"
      />
    </div>
  );
}

function ContactBlock() {
  const { settings } = useSettings();
  const leadForm = useLeadForm();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [preferredContact, setPreferredContact] =
    useState<(typeof CONTACT_METHODS)[number]>("WhatsApp");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await leadForm.submit({ name, email, phone, preferredContact, message });
    } catch {
      /* leadForm.error is set by the hook */
    }
  }

  return (
    <section id="contacto" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="font-[family-name:var(--font-byd-display)] text-2xl font-bold tracking-tight sm:text-3xl">
        El futuro se prueba manejando
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[#1E2A38]/60">
        Dejanos tus datos y un asesor de {settings.dealershipName} te contacta dentro de un día
        hábil.
      </p>

      {leadForm.success ? (
        <div className="mt-10 border border-[var(--byd-accent)]/30 bg-[#F1F4F7] p-6">
          <h3 className="text-base font-semibold text-[#0A1A2F]">Consulta enviada</h3>
          <p className="mt-2 text-sm text-[#1E2A38]/65">
            Ya la recibimos. Un asesor se comunica a la brevedad.
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
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
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

          <div>
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#5A6B7D]">
              Contacto preferido
            </span>
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredContact(method)}
                  className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${
                    preferredContact === method
                      ? "bg-[var(--byd-accent)] text-white"
                      : "border border-[#0A1A2F]/20 bg-white text-[#1E2A38]/70 hover:border-[var(--byd-accent)]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <BydField label="Mensaje">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={bydControlClass}
              placeholder="Contanos qué vehículo estás buscando…"
            />
          </BydField>

          {leadForm.error && (
            <p className="text-sm font-medium text-[#B42318]">{leadForm.error}</p>
          )}

          <BydButton type="submit" disabled={leadForm.submitting}>
            {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
          </BydButton>
        </form>
      )}
    </section>
  );
}
