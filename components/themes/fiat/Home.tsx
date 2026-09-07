"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment, estimateListingPayment } from "@/lib/finance";
import { CheckCircleIcon, ArrowRightIcon } from "@/components/icons";
import type { HomeProps } from "@/components/themes/types";
import { FiatShell } from "./ui/fiat-shell";
import { FiatButton } from "./ui/fiat-button";
import { FiatField, fiatControlClass } from "./ui/fiat-field";

// Copied verbatim from BMW's intro-section copy (Global Constraint: do
// not import across theme folders). Fiat renders these as a tight 2×2
// with check bullets rather than icon tiles, so only the text is kept.
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
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";

function listingMonthly(price: string): number | null {
  const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return estimateListingPayment(numeric);
}

export default function Home({ loading, filterCars }: HomeProps) {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "fiat");
  const featured = filterCars({}).slice(0, 6);

  return (
    <FiatShell>
      <Hero heroImage={settings.heroBannerImageUrl} dealershipName={logoText} />
      <TrustRow />
      <FeaturedInventory cars={featured} loading={loading} />
      <FinanceCalculator />
      <ContactBlock />
    </FiatShell>
  );
}

function Hero({ heroImage, dealershipName }: { heroImage: string; dealershipName: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--fiat-accent)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--fiat-accent)]" />
            Usados certificados
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Autos con onda,
            <br />
            <span className="text-[var(--fiat-accent)]">sin complicaciones.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#1a1a1a]/70 sm:text-base">
            Seleccionados a mano, revisados a fondo y con precio cerrado. Sin regateo, sin
            sorpresas, sin letra chica.
          </p>
          <div className="mt-7">
            <FiatButton href="#inventory">
              Ver inventario
              <ArrowRightIcon className="h-4 w-4" />
            </FiatButton>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F3ECE0] shadow-sm">
          <Image
            src={heroImage}
            alt={`Showroom de ${dealershipName}`}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function TrustRow() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GUARANTEES.map((item) => (
          <div
            key={item.title}
            className="flex gap-3 rounded-xl border border-[#1a1a1a]/10 bg-white p-4 shadow-sm"
          >
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fiat-accent)]" />
            <div>
              <h3 className="text-sm font-bold">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#1a1a1a]/60">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CarCard({ car }: { car: HomeProps["cars"][number] }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  const monthly = listingMonthly(car.price);
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#1a1a1a]/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3ECE0]">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img src={image} alt={car.title} className="h-full w-full object-cover" />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold">
          {car.year}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fiat-accent)]">
          {car.make}
        </span>
        <h3 className="text-sm font-bold leading-snug">{car.title}</h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <span className="block text-lg font-extrabold tracking-tight">{car.price}</span>
            {monthly && (
              <span className="text-xs text-[#1a1a1a]/50">
                desde ${Math.round(monthly).toLocaleString("en-US")}/mes
              </span>
            )}
          </div>
          <FiatButton href={`/inventory/${car.id}`} variant="outline" className="!px-3.5 !py-1.5 !text-xs">
            Ver
          </FiatButton>
        </div>
      </div>
    </div>
  );
}

function FeaturedInventory({ cars, loading }: { cars: HomeProps["cars"]; loading: boolean }) {
  return (
    <section id="inventory" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Destacados</h2>
        <FiatButton href="/inventory" variant="outline" className="!py-2">
          Ver todo el inventario
        </FiatButton>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-[#1a1a1a]/10 bg-white"
                aria-hidden
              >
                <div className="aspect-[4/3] animate-pulse bg-[#EDE4D6]" />
                <div className="flex flex-col gap-2 p-4">
                  <div className="h-3 w-14 animate-pulse rounded bg-[#EDE4D6]" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[#EDE4D6]" />
                  <div className="mt-3 h-6 w-20 animate-pulse rounded bg-[#EDE4D6]" />
                </div>
              </div>
            ))
          : cars.map((car) => <CarCard key={car.id} car={car} />)}
      </div>

      {!loading && cars.length === 0 && (
        <p className="mt-8 rounded-xl border border-[#1a1a1a]/10 bg-white p-6 text-sm text-[#1a1a1a]/60">
          Todavía no hay vehículos publicados.
        </p>
      )}
    </section>
  );
}

function FinanceCalculator() {
  const [price, setPrice] = useState(35000);
  const [downPayment, setDownPayment] = useState(10000);
  const [apr, setApr] = useState(6.9);
  const [term, setTerm] = useState(60);

  const principal = Math.max(0, price - downPayment);
  const monthly = monthlyPayment(principal, apr, term);

  return (
    <section id="finance" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Calculá tu cuota</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#1a1a1a]/60">
        Movés las barras, ves el número. Estimación orientativa sujeta a aprobación crediticia.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5 rounded-xl border border-[#1a1a1a]/10 bg-white p-6 shadow-sm">
          <RangeRow
            label="Precio del vehículo"
            value={`$${price.toLocaleString("en-US")}`}
            min={10000}
            max={200000}
            step={1000}
            current={price}
            onChange={setPrice}
          />
          <RangeRow
            label="Anticipo"
            value={`$${downPayment.toLocaleString("en-US")}`}
            min={0}
            max={Math.max(1000, price)}
            step={1000}
            current={Math.min(downPayment, price)}
            onChange={setDownPayment}
          />
          <RangeRow
            label="Tasa anual (TNA)"
            value={`${apr.toFixed(1)}%`}
            min={0}
            max={20}
            step={0.1}
            current={apr}
            onChange={setApr}
          />
          <RangeRow
            label="Plazo"
            value={`${term} meses`}
            min={12}
            max={84}
            step={12}
            current={term}
            onChange={setTerm}
          />
        </div>

        <div className="flex flex-col justify-center gap-1.5 rounded-xl bg-[var(--fiat-accent)] p-6 text-white shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
            Cuota mensual estimada
          </span>
          <span className="text-4xl font-extrabold tracking-tight">
            ${Math.round(monthly).toLocaleString("en-US")}
          </span>
          <span className="mt-2 border-t border-white/20 pt-3 text-xs text-white/70">
            Financiás ${principal.toLocaleString("en-US")} a {term} meses con TNA {apr.toFixed(1)}%.
          </span>
        </div>
      </div>
    </section>
  );
}

function RangeRow({
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
        <span className="text-xs font-semibold text-[#1a1a1a]/70">{label}</span>
        <span className="text-sm font-bold text-[var(--fiat-accent)]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--fiat-accent)]"
      />
    </div>
  );
}

function ContactBlock() {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "fiat");
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
    <section id="contact" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Escribinos</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#1a1a1a]/60">
        Dejanos tus datos y un asesor de {logoText} te contacta dentro de un día
        hábil.
      </p>

      {leadForm.success ? (
        <div className="mt-8 rounded-xl bg-[var(--fiat-accent)] p-6 text-white shadow-sm">
          <h3 className="text-base font-bold">Consulta enviada</h3>
          <p className="mt-1.5 text-sm text-white/85">
            Ya la recibimos. Un asesor se comunica a la brevedad.
          </p>
          <button
            type="button"
            onClick={() => leadForm.reset()}
            className="mt-4 rounded-full border border-white/60 px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-white hover:text-[var(--fiat-accent)]"
          >
            Enviar otra
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FiatField label="Nombre completo">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={fiatControlClass}
              />
            </FiatField>
            <FiatField label="Teléfono">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={fiatControlClass}
              />
            </FiatField>
          </div>

          <FiatField label="Correo electrónico">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fiatControlClass}
            />
          </FiatField>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-[#1a1a1a]/70">
              Contacto preferido
            </span>
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredContact(method)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    preferredContact === method
                      ? "bg-[var(--fiat-accent)] text-white"
                      : "border border-[#1a1a1a]/15 bg-white text-[#1a1a1a]/70 hover:border-[var(--fiat-accent)]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <FiatField label="Mensaje">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={fiatControlClass}
              placeholder="Contanos qué estás buscando…"
            />
          </FiatField>

          {leadForm.error && (
            <p className="text-sm font-semibold text-[var(--fiat-accent)]">{leadForm.error}</p>
          )}

          <FiatButton type="submit" disabled={leadForm.submitting}>
            {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
          </FiatButton>
        </form>
      )}
    </section>
  );
}
