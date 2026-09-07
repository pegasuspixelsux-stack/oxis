"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment } from "@/lib/finance";
import {
  ShieldIcon,
  ChecklistIcon,
  TagIcon,
  DocumentIcon,
  ArrowRightIcon,
} from "@/components/icons";
import type { HomeProps } from "@/components/themes/types";
import { MiniShell } from "./ui/mini-shell";
import { MiniButton } from "./ui/mini-button";
import { MiniField, miniControlClass } from "./ui/mini-field";

// Copied verbatim from BMW's intro-section (Global Constraint: do not
// import across theme folders).
const GUARANTEES = [
  {
    icon: ShieldIcon,
    title: "Inspección de 150 puntos",
    description:
      "Cada vehículo es desarmado por técnicos certificados y revisado de punta a punta antes de llegar al showroom.",
  },
  {
    icon: ChecklistIcon,
    title: "Garantía de devolución de 7 días",
    description:
      "Manejalo una semana. Si no es lo que esperabas, lo devolvés y te reintegramos todo — sin costo de reposición ni letra chica.",
  },
  {
    icon: TagIcon,
    title: "Precios transparentes, sin regateo",
    description:
      "El precio en el cartel es el precio que pagás. Publicamos nuestro análisis de mercado para que lo verifiques vos mismo.",
  },
  {
    icon: DocumentIcon,
    title: "Informe de historial gratuito",
    description:
      "Cada publicación incluye un informe de historial completo sin costo — siniestros, estado de título y service incluidos.",
  },
];

const CONTACT_METHODS = ["WhatsApp", "Teléfono", "Email"] as const;

const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";

function numericPrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ""), 10);
}

export default function Home({ loading, filterCars }: HomeProps) {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "mini");
  const featured = filterCars({}).slice(0, 6);

  return (
    <MiniShell>
      <Hero heroImage={settings.heroBannerImageUrl} dealershipName={logoText} />
      <GuaranteesStrip />
      <FeaturedInventory cars={featured} loading={loading} />
      <FinanceCalculator />
      <ContactBlock />
    </MiniShell>
  );
}

function Hero({ heroImage, dealershipName }: { heroImage: string; dealershipName: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <Image
        src={heroImage}
        alt={`Showroom de ${dealershipName}`}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
      />
      <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-44">
        <p className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.3em] text-[var(--mini-accent)]">
          <span className="inline-block h-3 w-3 rounded-full bg-[var(--mini-accent)]" />
          Usados certificados
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-extrabold uppercase leading-[0.95] tracking-tighter sm:text-7xl lg:text-8xl">
          Elegí grande.
          <br />
          <span className="text-[var(--mini-accent)]">Manejá chico.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
          Autos seleccionados a mano, revisados a fondo y con precio cerrado. Sin regateo, sin
          sorpresas, sin letra chica.
        </p>
        <div className="mt-10">
          <MiniButton href="#inventory">
            Ver inventario
            <ArrowRightIcon className="h-4 w-4" />
          </MiniButton>
        </div>
      </div>
    </section>
  );
}

function GuaranteesStrip() {
  return (
    <section className="border-b-2 border-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-0.5 border-x-2 border-neutral-950 bg-neutral-950 md:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((item) => (
            <div key={item.title} className="flex flex-col gap-4 bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-950 bg-[var(--mini-accent)] text-white">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide">{item.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CarCard({ car }: { car: HomeProps["cars"][number] }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  return (
    <div className="flex flex-col border-2 border-neutral-950 bg-white">
      <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-neutral-950 bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img src={image} alt={car.title} className="h-full w-full object-cover" />
        <span className="absolute right-3 top-3 border-2 border-neutral-950 bg-white px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide">
          {car.year}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--mini-accent)]">
          {car.make}
        </span>
        <h3 className="text-base font-extrabold uppercase leading-tight tracking-tight">
          {car.title}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-4">
          <span className="text-2xl font-extrabold tracking-tight">{car.price}</span>
          <MiniButton href={`/inventory/${car.id}`} variant="outline" className="!px-4 !py-2 !text-xs">
            Ver
          </MiniButton>
        </div>
      </div>
    </div>
  );
}

function FeaturedInventory({
  cars,
  loading,
}: {
  cars: HomeProps["cars"];
  loading: boolean;
}) {
  return (
    <section id="inventory" className="border-b-2 border-neutral-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold uppercase tracking-tighter sm:text-5xl">
            Destacados
          </h2>
          <MiniButton href="/inventory" variant="outline">
            Ver todo el inventario
          </MiniButton>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col border-2 border-neutral-950 bg-white"
                  aria-hidden
                >
                  <div className="aspect-[4/3] animate-pulse border-b-2 border-neutral-950 bg-neutral-200" />
                  <div className="flex flex-col gap-3 p-5">
                    <div className="h-3 w-16 animate-pulse bg-neutral-200" />
                    <div className="h-5 w-3/4 animate-pulse bg-neutral-200" />
                    <div className="mt-4 h-7 w-24 animate-pulse bg-neutral-200" />
                  </div>
                </div>
              ))
            : cars.map((car) => <CarCard key={car.id} car={car} />)}
        </div>

        {!loading && cars.length === 0 && (
          <p className="mt-10 border-2 border-neutral-950 p-8 text-sm font-bold uppercase tracking-wide">
            Todavía no hay vehículos publicados.
          </p>
        )}
      </div>
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
    <section id="finance" className="border-b-2 border-neutral-950 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold uppercase tracking-tighter sm:text-5xl">
          Calculá tu cuota
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-neutral-600">
          Movés las barras, ves el número. Estimación orientativa sujeta a aprobación crediticia.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-0 border-2 border-neutral-950 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-7 border-b-2 border-neutral-950 p-8 lg:border-b-0 lg:border-r-2">
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

          <div className="flex flex-col justify-center gap-2 bg-neutral-950 p-8 text-white">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
              Cuota mensual estimada
            </span>
            <span className="text-5xl font-extrabold tracking-tighter text-[var(--mini-accent)]">
              ${Math.round(monthly).toLocaleString("en-US")}
            </span>
            <span className="mt-2 border-t-2 border-neutral-800 pt-3 text-xs text-neutral-400">
              Financiás ${principal.toLocaleString("en-US")} a {term} meses con TNA {apr.toFixed(1)}%.
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
        <span className="text-[11px] font-extrabold uppercase tracking-widest">{label}</span>
        <span className="text-sm font-extrabold text-[var(--mini-accent)]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--mini-accent)]"
      />
    </div>
  );
}

function ContactBlock() {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "mini");
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
    <section id="contact" className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold uppercase tracking-tighter sm:text-5xl">
          Escribinos
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Dejanos tus datos y un asesor de {logoText} te contacta dentro de un día
          hábil.
        </p>

        {leadForm.success ? (
          <div className="mt-10 border-2 border-neutral-950 bg-[var(--mini-accent)] p-8 text-white">
            <h3 className="text-lg font-extrabold uppercase tracking-wide">Consulta enviada</h3>
            <p className="mt-2 text-sm">
              Ya la recibimos. Un asesor se comunica a la brevedad.
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
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
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

            <div>
              <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-widest">
                Contacto preferido
              </span>
              <div className="flex flex-wrap gap-2">
                {CONTACT_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContact(method)}
                    className={`border-2 border-neutral-950 px-4 py-2 text-xs font-extrabold uppercase tracking-widest transition-colors ${
                      preferredContact === method
                        ? "bg-[var(--mini-accent)] text-white"
                        : "bg-white text-neutral-950 hover:bg-neutral-100"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <MiniField label="Mensaje">
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={miniControlClass}
                placeholder="Contanos qué estás buscando…"
              />
            </MiniField>

            {leadForm.error && (
              <p className="text-sm font-bold text-[var(--mini-accent)]">{leadForm.error}</p>
            )}

            <MiniButton type="submit" disabled={leadForm.submitting}>
              {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
            </MiniButton>
          </form>
        )}
      </div>
    </section>
  );
}
