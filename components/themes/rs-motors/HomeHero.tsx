"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment, estimateListingPayment } from "@/lib/finance";
import { ArrowRightIcon } from "@/components/icons";
import type { HomeProps } from "@/components/themes/types";
import { RsShell } from "./ui/rs-shell";
import { RsButton } from "./ui/rs-button";
import { RsField, rsControlClass } from "./ui/rs-field";

// Copied verbatim from BMW's intro-section copy (Global Constraint: do
// not import across theme folders). rs-motors renders these as a hard
// four-column strip with numbered index markers, so only the text is
// kept.
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
  const { logoText } = resolveThemeSettings(settings, "rs-motors");
  const featured = filterCars({}).slice(0, 6);

  return (
    <RsShell>
      <Hero heroImage={settings.heroBannerImageUrl} dealershipName={logoText} />
      <GuaranteeStrip />
      <FeaturedGrid cars={featured} loading={loading} />
      <FinanceCalculator />
      <ContactBlock />
    </RsShell>
  );
}

function Hero({ heroImage, dealershipName }: { heroImage: string; dealershipName: string }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt={`Showroom de ${dealershipName}`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--rs-accent)]">
          <span className="inline-block h-4 w-1 -skew-x-12 bg-[var(--rs-accent)]" />
          Pedigrí de competición
        </p>
        <h1 className="mt-6 max-w-4xl text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
          Rendimiento
          <br />
          <span className="text-[var(--rs-accent)]">sin concesiones.</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
          Seleccionamos máquinas de alto rendimiento, las llevamos al banco y las devolvemos a
          la pista. Cada unidad con hoja de especificaciones abierta y precio cerrado.
        </p>
        <div className="mt-10">
          <RsButton href="#inventory">
            Ver inventario
            <ArrowRightIcon className="h-4 w-4" />
          </RsButton>
        </div>
      </div>
    </section>
  );
}

function GuaranteeStrip() {
  return (
    <section className="border-b border-white/10 bg-[#0A0A0A]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
        {GUARANTEES.map((item, i) => (
          <div key={item.title} className="p-6 lg:p-8">
            <span className="font-[family-name:var(--font-rs-mono)] text-xs text-[var(--rs-accent)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-sm font-bold uppercase tracking-[0.1em] text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-white/50">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TelemetryCard({ car }: { car: HomeProps["cars"][number] }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  const monthly = listingMonthly(car.price);
  const readout = [
    { k: "AÑO", v: String(car.year) },
    { k: "KM", v: car.mileage || "—" },
    { k: "TRACC", v: car.drivetrain || "—" },
    { k: "TRANS", v: car.transmission || "—" },
  ];

  return (
    <div className="group flex flex-col border border-white/15 bg-[#0A0A0A] transition-colors hover:border-[var(--rs-accent)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img
          src={image}
          alt={car.title}
          className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        />
        <span className="absolute left-0 top-0 bg-[var(--rs-accent)] px-2.5 py-1 font-[family-name:var(--font-rs-mono)] text-[11px] font-bold text-white">
          {car.make}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-sm font-bold uppercase leading-snug tracking-[0.05em] text-white">
          {car.title}
        </h3>

        <dl className="mt-4 grid grid-cols-4 divide-x divide-white/10 border-y border-white/10 font-[family-name:var(--font-rs-mono)]">
          {readout.map((r) => (
            <div key={r.k} className="px-2 py-2.5 text-center first:pl-0">
              <dt className="text-[9px] tracking-[0.15em] text-white/40">{r.k}</dt>
              <dd className="mt-1 truncate text-[11px] text-white/80">{r.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="block font-[family-name:var(--font-rs-mono)] text-lg font-bold tracking-tight text-white">
              {car.price}
            </span>
            {monthly && (
              <span className="font-[family-name:var(--font-rs-mono)] text-[11px] text-white/40">
                ${Math.round(monthly).toLocaleString("en-US")}/mes
              </span>
            )}
          </div>
          <RsButton
            href={`/inventory/${car.id}`}
            variant="outline"
            className="!px-4 !py-2 !text-[10px]"
          >
            Ficha
          </RsButton>
        </div>
      </div>
    </div>
  );
}

function FeaturedGrid({ cars, loading }: { cars: HomeProps["cars"]; loading: boolean }) {
  return (
    <section id="inventory" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          Parrilla de salida
        </h2>
        <RsButton href="/inventory" variant="outline">
          Todo el inventario
        </RsButton>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-white/15 bg-[#0A0A0A]" aria-hidden>
                <div className="aspect-[16/10] animate-pulse bg-white/5" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse bg-white/5" />
                  <div className="h-10 w-full animate-pulse bg-white/5" />
                  <div className="h-6 w-24 animate-pulse bg-white/5" />
                </div>
              </div>
            ))
          : cars.map((car) => <TelemetryCard key={car.id} car={car} />)}
      </div>

      {!loading && cars.length === 0 && (
        <p className="mt-10 border border-white/15 bg-[#0A0A0A] p-6 text-sm text-white/50">
          Todavía no hay vehículos publicados.
        </p>
      )}
    </section>
  );
}

function FinanceCalculator() {
  const [price, setPrice] = useState(45000);
  const [downPayment, setDownPayment] = useState(15000);
  const [apr, setApr] = useState(6.9);
  const [term, setTerm] = useState(60);

  const principal = Math.max(0, price - downPayment);
  const monthly = monthlyPayment(principal, apr, term);

  return (
    <section
      id="finance"
      className="border-y border-white/10 bg-[#0A0A0A]"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h2 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          Telemetría financiera
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
          Ajustá los parámetros y leé la cuota en tiempo real. Estimación orientativa sujeta a
          aprobación crediticia.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6 border border-white/15 bg-black p-6">
            <RangeRow
              label="Precio del vehículo"
              value={`$${price.toLocaleString("en-US")}`}
              min={10000}
              max={250000}
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

          <div className="flex flex-col justify-center gap-2 border border-[var(--rs-accent)] bg-[var(--rs-accent)] p-6 text-white">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
              Cuota mensual estimada
            </span>
            <span className="font-[family-name:var(--font-rs-mono)] text-5xl font-bold tracking-tight">
              ${Math.round(monthly).toLocaleString("en-US")}
            </span>
            <span className="mt-3 border-t border-white/25 pt-3 font-[family-name:var(--font-rs-mono)] text-xs text-white/75">
              Financiás ${principal.toLocaleString("en-US")} a {term} meses · TNA {apr.toFixed(1)}%.
            </span>
          </div>
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
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
          {label}
        </span>
        <span className="font-[family-name:var(--font-rs-mono)] text-sm font-bold text-[var(--rs-accent)]">
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
        className="mt-3 w-full accent-[var(--rs-accent)]"
      />
    </div>
  );
}

function ContactBlock() {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "rs-motors");
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
    <section id="contact" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h2 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
        Contacto de boxes
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-white/50">
        Dejanos tus datos y un asesor de {logoText} te contacta dentro de un día
        hábil.
      </p>

      {leadForm.success ? (
        <div className="mt-10 border border-[var(--rs-accent)] bg-[#0A0A0A] p-6">
          <h3 className="text-base font-bold uppercase tracking-[0.1em] text-white">
            Consulta enviada
          </h3>
          <p className="mt-2 text-sm text-white/60">
            Ya la recibimos. Un asesor se comunica a la brevedad.
          </p>
          <button
            type="button"
            onClick={() => leadForm.reset()}
            className="mt-4 rounded-none border border-white/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-[var(--rs-accent)] hover:bg-[var(--rs-accent)]"
          >
            Enviar otra
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <RsField label="Nombre completo">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={rsControlClass}
              />
            </RsField>
            <RsField label="Teléfono">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={rsControlClass}
              />
            </RsField>
          </div>

          <RsField label="Correo electrónico">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={rsControlClass}
            />
          </RsField>

          <div>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
              Contacto preferido
            </span>
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredContact(method)}
                  className={`rounded-none px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    preferredContact === method
                      ? "bg-[var(--rs-accent)] text-white"
                      : "border border-white/20 text-white/60 hover:border-[var(--rs-accent)]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <RsField label="Mensaje">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={rsControlClass}
              placeholder="Contanos qué máquina estás buscando…"
            />
          </RsField>

          {leadForm.error && (
            <p className="text-sm font-bold text-[var(--rs-accent)]">{leadForm.error}</p>
          )}

          <RsButton type="submit" disabled={leadForm.submitting}>
            {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
          </RsButton>
        </form>
      )}
    </section>
  );
}
