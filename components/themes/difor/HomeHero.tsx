"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useSettings } from "@/components/settings-provider";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment, estimateListingPayment } from "@/lib/finance";
import { ArrowRightIcon } from "@/components/icons";
import type { HomeProps } from "@/components/themes/types";
import { DiforShell } from "./ui/difor-shell";
import { DiforButton } from "./ui/difor-button";
import { DiforField, diforControlClass } from "./ui/difor-field";

// Copied verbatim from BMW's intro-section copy (hard rule: no imports
// across theme folders). difor renders these as a four-item guarantees
// strip with green verification ticks, so only the text is kept.
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
    <DiforShell>
      <Hero heroImage={settings.heroBannerImageUrl} dealershipName={settings.dealershipName} />
      <GuaranteeStrip />
      <FeaturedGrid cars={featured} loading={loading} />
      <FinancingModule />
      <ContactBlock />
    </DiforShell>
  );
}

function Hero({ heroImage, dealershipName }: { heroImage: string; dealershipName: string }) {
  return (
    <section className="border-b border-[#1B2733]/10 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--difor-accent)]">
            <span className="inline-block h-4 w-1 bg-[var(--difor-accent)]" />
            Concesionaria multimarca de confianza
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Calidad verificada y precios transparentes
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#1B2733]/65">
            Cada unidad pasa una inspección de 150 puntos, se publica con su historial completo
            y con la cuota calculada. Sin sorpresas, sin regateo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <DiforButton href="#inventory">
              Ver inventario
              <ArrowRightIcon className="h-4 w-4" />
            </DiforButton>
            <DiforButton href="#financiacion" variant="outline">
              Calculá tu cuota
            </DiforButton>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#1F8B3F]">
            <span className="flex items-center gap-1.5">
              <span aria-hidden>✓</span> Inspección de 150 puntos
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden>✓</span> Historial incluido
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden>✓</span> Devolución en 7 días
            </span>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#1B2733]/10 bg-[#F5F7FA]">
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

function GuaranteeStrip() {
  return (
    <section className="border-b border-[#1B2733]/10 bg-[#F5F7FA]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Lo que verificamos en cada vehículo
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-px border border-[#1B2733]/10 bg-[#1B2733]/10 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((item) => (
            <div key={item.title} className="bg-white p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-none bg-[#1F8B3F]/10 text-base font-semibold text-[#1F8B3F]">
                ✓
              </span>
              <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#1B2733]/60">{item.description}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[#1F8B3F]">
                Verificado
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-none border border-[#1F8B3F]/30 bg-[#1F8B3F]/10 font-medium text-[#1F8B3F] ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span aria-hidden>✓</span> Inspección verificada
    </span>
  );
}

function ListingCard({ car }: { car: HomeProps["cars"][number] }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  const monthly = listingMonthly(car.price);

  return (
    <article className="flex flex-col border border-[#1B2733]/12 bg-white transition-colors hover:border-[var(--difor-accent)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F7FA]">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img src={image} alt={car.title} className="h-full w-full object-cover" />
        <span className="absolute left-0 top-0 bg-[var(--difor-accent)] px-2.5 py-1 text-xs font-medium text-white">
          {car.make}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold leading-snug">{car.title}</h3>
        </div>
        <div className="mt-3">
          <VerifiedBadge compact />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#1B2733]/10 pt-4 text-xs text-[#1B2733]/60">
          <div className="flex justify-between">
            <dt>Año</dt>
            <dd className="font-medium text-[#1B2733]">{car.year}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Kilometraje</dt>
            <dd className="font-medium text-[#1B2733]">{car.mileage || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Transmisión</dt>
            <dd className="font-medium text-[#1B2733]">{car.transmission || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tracción</dt>
            <dd className="font-medium text-[#1B2733]">{car.drivetrain || "—"}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="block font-[family-name:var(--font-difor-mono)] text-lg font-semibold">
              {car.price}
            </span>
            {monthly && (
              <span className="font-[family-name:var(--font-difor-mono)] text-xs text-[#1B2733]/50">
                ${Math.round(monthly).toLocaleString("en-US")}/mes
              </span>
            )}
          </div>
          <DiforButton
            href={`/inventory/${car.id}`}
            variant="outline"
            className="!px-3.5 !py-2 !text-xs"
          >
            Ver ficha
          </DiforButton>
        </div>
      </div>
    </article>
  );
}

function FeaturedGrid({ cars, loading }: { cars: HomeProps["cars"]; loading: boolean }) {
  return (
    <section id="inventory" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1B2733]/10 pb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Vehículos destacados</h2>
          <p className="mt-2 text-sm text-[#1B2733]/60">
            Selección de unidades con inspección verificada y disponibilidad inmediata.
          </p>
        </div>
        <DiforButton href="/inventory" variant="outline">
          Ver todo el inventario
        </DiforButton>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-[#1B2733]/12 bg-white" aria-hidden>
                <div className="aspect-[16/10] animate-pulse bg-[#1B2733]/5" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse bg-[#1B2733]/5" />
                  <div className="h-16 w-full animate-pulse bg-[#1B2733]/5" />
                  <div className="h-6 w-24 animate-pulse bg-[#1B2733]/5" />
                </div>
              </div>
            ))
          : cars.map((car) => <ListingCard key={car.id} car={car} />)}
      </div>

      {!loading && cars.length === 0 && (
        <p className="mt-10 border border-[#1B2733]/12 bg-white p-6 text-sm text-[#1B2733]/60">
          Todavía no hay vehículos publicados.
        </p>
      )}
    </section>
  );
}

function FinancingModule() {
  const [price, setPrice] = useState(28000);
  const [downPayment, setDownPayment] = useState(8000);
  const [apr, setApr] = useState(6.9);
  const [term, setTerm] = useState(60);

  const principal = Math.max(0, price - downPayment);
  const monthly = monthlyPayment(principal, apr, term);
  const totalCost = monthly * term + downPayment;

  return (
    <section id="financiacion" className="border-y border-[#1B2733]/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Calculadora de financiación
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#1B2733]/60">
            Estimá tu cuota mensual antes de venir. Los valores son orientativos y quedan
            sujetos a aprobación crediticia.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px border border-[#1B2733]/12 bg-[#1B2733]/12 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-6 bg-[#F5F7FA] p-6 sm:p-8">
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

          <div className="flex flex-col justify-center gap-1 bg-[var(--difor-accent)] p-6 text-white sm:p-8">
            <span className="text-xs font-medium uppercase tracking-wide text-white/75">
              Cuota mensual estimada
            </span>
            <span className="font-[family-name:var(--font-difor-mono)] text-4xl font-semibold">
              ${Math.round(monthly).toLocaleString("en-US")}
            </span>
            <dl className="mt-5 flex flex-col gap-2 border-t border-white/25 pt-4 font-[family-name:var(--font-difor-mono)] text-xs text-white/80">
              <div className="flex justify-between">
                <dt>Monto a financiar</dt>
                <dd>${principal.toLocaleString("en-US")}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Plazo</dt>
                <dd>{term} meses · TNA {apr.toFixed(1)}%</dd>
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
        <span className="text-xs font-medium uppercase tracking-wide text-[#1B2733]/55">
          {label}
        </span>
        <span className="font-[family-name:var(--font-difor-mono)] text-sm font-semibold text-[var(--difor-accent)]">
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
        className="mt-3 w-full accent-[var(--difor-accent)]"
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
    <section id="contacto" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Escribinos</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#1B2733]/60">
        Dejanos tus datos y un asesor de {settings.dealershipName} te contacta dentro de un día
        hábil.
      </p>

      {leadForm.success ? (
        <div className="mt-10 border border-[#1F8B3F]/30 bg-[#1F8B3F]/10 p-6">
          <h3 className="text-base font-semibold text-[#1B2733]">Consulta enviada</h3>
          <p className="mt-2 text-sm text-[#1B2733]/65">
            Ya la recibimos. Un asesor se comunica a la brevedad.
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
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
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

          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#1B2733]/55">
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
                      ? "bg-[var(--difor-accent)] text-white"
                      : "border border-[#1B2733]/20 bg-white text-[#1B2733]/70 hover:border-[var(--difor-accent)]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <DiforField label="Mensaje">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={diforControlClass}
              placeholder="Contanos qué vehículo estás buscando…"
            />
          </DiforField>

          {leadForm.error && (
            <p className="text-sm font-medium text-[#B42318]">{leadForm.error}</p>
          )}

          <DiforButton type="submit" disabled={leadForm.submitting}>
            {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
          </DiforButton>
        </form>
      )}
    </section>
  );
}
