"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment, estimateListingPayment } from "@/lib/finance";
import type { HomeProps } from "@/components/themes/types";
import { RcShell } from "./ui/rc-shell";
import { RcButton } from "./ui/rc-button";
import { RcField, rcControlClass } from "./ui/rc-field";

// Copied verbatim (hard rule: no imports across theme folders). renato-conti
// renders these as a quiet hairline-separated numbered passage, so only
// the text is kept.
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
  const { logoText } = resolveThemeSettings(settings, "renato-conti");
  const curated = filterCars({}).slice(0, 6);

  return (
    <RcShell>
      <Hero heroImage={settings.heroBannerImageUrl} dealershipName={logoText} />
      <GuaranteesPassage />
      <CuratedCollection cars={curated} loading={loading} />
      <FinancePassage />
      <ContactBlock />
    </RcShell>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.4em] text-[#8C8C8C]">
      {children}
    </p>
  );
}

function Hero({ heroImage, dealershipName }: { heroImage: string; dealershipName: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-32 sm:px-12 sm:py-44">
      <div className="grid grid-cols-1 gap-20 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <Eyebrow>Black Edition</Eyebrow>
          <h1 className="mt-12 font-[family-name:var(--font-rc-display)] text-5xl font-light uppercase leading-[1.05] tracking-[0.15em] text-[#E8E8E8] sm:text-7xl">
            Una curaduría
          </h1>
          <p className="mt-12 max-w-sm text-sm leading-relaxed text-[#8C8C8C]">
            No exhibimos un catálogo. Reunimos una serie breve de piezas seleccionadas — procedencia
            clara, mantenimiento documentado, presencia impecable. Por invitación.
          </p>
          <div className="mt-16">
            <RcButton href="#coleccion" variant="outline">
              Ver la colección
            </RcButton>
          </div>
        </div>

        <div className="relative aspect-[3/4] w-full border border-[#FFFFFF14]">
          <Image
            src={heroImage}
            alt={`${dealershipName} — Black Edition`}
            fill
            priority
            sizes="(min-width: 1024px) 36vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function GuaranteesPassage() {
  return (
    <section className="border-t border-[#FFFFFF14]">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-12">
        <Eyebrow>Bespoke</Eyebrow>
        <h2 className="mt-8 max-w-xl font-[family-name:var(--font-rc-display)] text-3xl font-light uppercase leading-tight tracking-[0.15em] text-[#E8E8E8] sm:text-4xl">
          Cuatro certezas
        </h2>
        <ol className="mt-16 border-t border-[#FFFFFF14]">
          {GUARANTEES.map((item, i) => (
            <li
              key={item.title}
              className="grid grid-cols-1 gap-4 border-b border-[#FFFFFF14] py-10 sm:grid-cols-[4rem_1fr_2fr]"
            >
              <span className="font-[family-name:var(--font-rc-display)] text-lg font-light tracking-[0.2em] text-[var(--rc-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-[family-name:var(--font-rc-display)] text-[12px] uppercase tracking-[0.2em] text-[#E8E8E8]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#8C8C8C]">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CollectionItem({ car }: { car: HomeProps["cars"][number] }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  const monthly = listingMonthly(car.price);

  return (
    <Link href={`/inventory/${car.id}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#FFFFFF14] bg-[#0A0A0A]">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img
          src={image}
          alt={car.title}
          className="h-full w-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100"
        />
      </div>
      <p className="mt-6 font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C]">
        {car.make} · {car.year}
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-rc-display)] text-lg font-light uppercase tracking-[0.12em] text-[#E8E8E8] transition-colors group-hover:text-[var(--rc-accent)]">
        {car.title}
      </h3>
      <p className="mt-4 border-t border-[#FFFFFF14] pt-4 text-sm text-[#8C8C8C]">
        {car.price}
        {monthly && (
          <span className="text-[#5A5A5A]">
            {" "}
            · ${Math.round(monthly).toLocaleString("en-US")}/mes
          </span>
        )}
      </p>
    </Link>
  );
}

function CuratedCollection({
  cars,
  loading,
}: {
  cars: HomeProps["cars"];
  loading: boolean;
}) {
  return (
    <section id="coleccion" className="scroll-mt-16 border-t border-[#FFFFFF14]">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-12">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#FFFFFF14] pb-10">
          <div>
            <Eyebrow>Piezas seleccionadas</Eyebrow>
            <h2 className="mt-8 font-[family-name:var(--font-rc-display)] text-3xl font-light uppercase tracking-[0.15em] text-[#E8E8E8] sm:text-4xl">
              En exhibición
            </h2>
          </div>
          <RcButton href="/inventory" variant="outline">
            Ver todo
          </RcButton>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-x-16 gap-y-24 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} aria-hidden className="flex flex-col gap-4">
                  <div className="aspect-[4/5] w-full animate-pulse border border-[#FFFFFF14] bg-[#FFFFFF0A]" />
                  <div className="mt-2 h-2 w-24 animate-pulse bg-[#FFFFFF0A]" />
                  <div className="h-3 w-3/4 animate-pulse bg-[#FFFFFF0A]" />
                  <div className="h-2 w-1/3 animate-pulse bg-[#FFFFFF0A]" />
                </div>
              ))
            : cars.map((car) => <CollectionItem key={car.id} car={car} />)}
        </div>

        {!loading && cars.length === 0 && (
          <p className="mt-20 border border-[#FFFFFF14] p-10 text-sm text-[#8C8C8C]">
            La curaduría se está renovando. Vuelva pronto.
          </p>
        )}
      </div>
    </section>
  );
}

function FinancePassage() {
  const [price, setPrice] = useState(48000);
  const [downPayment, setDownPayment] = useState(15000);
  const [apr, setApr] = useState(6.9);
  const [term, setTerm] = useState(48);

  const principal = Math.max(0, price - Math.min(downPayment, price));
  const monthly = monthlyPayment(principal, apr, term);

  const rows = [
    { label: "Valor de la pieza", value: `$${price.toLocaleString("en-US")}`, set: setPrice, step: 1000, current: price },
    {
      label: "Entrega inicial",
      value: `$${Math.min(downPayment, price).toLocaleString("en-US")}`,
      set: setDownPayment,
      step: 1000,
      current: downPayment,
    },
    { label: "TNA", value: `${apr.toFixed(1)}%`, set: setApr, step: 0.1, current: apr },
    { label: "Plazo (meses)", value: `${term}`, set: setTerm, step: 12, current: term },
  ];

  return (
    <section className="border-t border-[#FFFFFF14]">
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
          <div>
            <Eyebrow>Financiación</Eyebrow>
            <h2 className="mt-8 font-[family-name:var(--font-rc-display)] text-3xl font-light uppercase leading-tight tracking-[0.15em] text-[#E8E8E8] sm:text-4xl">
              Una estimación discreta
            </h2>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-[#8C8C8C]">
              Valores orientativos, sujetos a aprobación crediticia. Cualquier estructura se define
              en privado.
            </p>
          </div>

          <div className="flex flex-col">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-6 border-t border-[#FFFFFF14] py-5"
              >
                <span className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.28em] text-[#8C8C8C]">
                  {row.label}
                </span>
                <span className="flex items-center gap-4">
                  <span className="text-sm tabular-nums text-[#E8E8E8]">{row.value}</span>
                  <input
                    type="number"
                    step={row.step}
                    value={row.current}
                    onChange={(e) => row.set(Number(e.target.value))}
                    aria-label={row.label}
                    className="w-24 rounded-none border-0 border-b border-[#FFFFFF29] bg-transparent px-0 py-1 text-right text-sm tabular-nums text-[#E8E8E8] outline-none focus:border-[#E8E8E8]"
                  />
                </span>
              </div>
            ))}
            <div className="mt-6 flex items-baseline justify-between border-t border-[#FFFFFF29] pt-8">
              <span className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.28em] text-[#8C8C8C]">
                Cuota mensual estimada
              </span>
              <span className="font-[family-name:var(--font-rc-display)] text-4xl font-light tabular-nums tracking-[0.08em] text-[var(--rc-accent)]">
                ${Math.round(monthly).toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactBlock() {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "renato-conti");
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
    <section id="contacto" className="border-t border-[#FFFFFF14]">
      <div className="mx-auto max-w-2xl px-6 py-28 sm:px-12">
        <Eyebrow>Por invitación</Eyebrow>
        <h2 className="mt-8 font-[family-name:var(--font-rc-display)] text-3xl font-light uppercase tracking-[0.15em] text-[#E8E8E8] sm:text-4xl">
          Escríbanos
        </h2>
        <p className="mt-8 text-sm leading-relaxed text-[#8C8C8C]">
          Deje sus datos y un asesor de {logoText} le responde dentro de un día hábil,
          con la reserva que el caso amerita.
        </p>

        {leadForm.success ? (
          <div className="mt-16 border border-[#FFFFFF29] p-10">
            <h3 className="font-[family-name:var(--font-rc-display)] text-lg font-light uppercase tracking-[0.15em] text-[#E8E8E8]">
              Consulta recibida
            </h3>
            <p className="mt-4 text-sm text-[#8C8C8C]">Un asesor se comunica a la brevedad.</p>
            <button
              type="button"
              onClick={() => leadForm.reset()}
              className="mt-8 rounded-none border border-[#FFFFFF33] px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#E8E8E8] transition-colors hover:border-[#E8E8E8]"
            >
              Enviar otra
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-16 flex flex-col gap-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              <RcField label="Nombre completo">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={rcControlClass}
                />
              </RcField>
              <RcField label="Teléfono">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className={rcControlClass}
                />
              </RcField>
            </div>

            <RcField label="Correo electrónico">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={rcControlClass}
              />
            </RcField>

            <div>
              <span className="mb-4 block font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.28em] text-[#8C8C8C]">
                Contacto preferido
              </span>
              <div className="flex flex-wrap gap-3">
                {CONTACT_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContact(method)}
                    className={`rounded-none px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                      preferredContact === method
                        ? "bg-[#E8E8E8] text-black"
                        : "border border-[#FFFFFF33] text-[#8C8C8C] hover:border-[#E8E8E8] hover:text-[#E8E8E8]"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <RcField label="Mensaje">
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={rcControlClass}
                placeholder="Cuéntenos qué pieza le interesa…"
              />
            </RcField>

            {leadForm.error && <p className="text-sm text-[#C77]">{leadForm.error}</p>}

            <RcButton type="submit" disabled={leadForm.submitting}>
              {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
            </RcButton>
          </form>
        )}
      </div>
    </section>
  );
}
