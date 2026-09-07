"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment, estimateListingPayment } from "@/lib/finance";
import type { HomeProps } from "@/components/themes/types";
import { VoituretShell } from "./ui/voituret-shell";
import { VoituretButton } from "./ui/voituret-button";
import { VoituretField, voituretControlClass } from "./ui/voituret-field";

// Copied verbatim from BMW's intro-section copy (hard rule: no imports
// across theme folders). voituret renders these as a quiet hairline-
// separated passage, so only the text is kept.
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
  const { logoText } = resolveThemeSettings(settings, "voituret");
  const featured = filterCars({}).slice(0, 6);

  return (
    <VoituretShell>
      <Hero heroImage={settings.heroBannerImageUrl} dealershipName={logoText} />
      <GuaranteesPassage />
      <CuratedSelection cars={featured} loading={loading} />
      <FinancePassage />
      <ContactBlock />
    </VoituretShell>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[var(--voituret-accent)]">
      {children}
    </p>
  );
}

function Hero({ heroImage, dealershipName }: { heroImage: string; dealershipName: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <Eyebrow>Una selección</Eyebrow>
          <h1 className="mt-8 font-[family-name:var(--font-voituret-serif)] text-5xl font-light leading-[1.1] tracking-[0.01em] sm:text-6xl">
            Piezas escogidas, una por una
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-[#1A1A1A]/60">
            No publicamos un catálogo. Reunimos una colección breve de automóviles con
            procedencia clara, mantenimiento documentado y una estética que merece atención.
          </p>
          <div className="mt-12">
            <VoituretButton href="#inventory">Ver la colección</VoituretButton>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full border border-[#1A1A1A]/12">
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

function GuaranteesPassage() {
  return (
    <section className="border-y border-[#1A1A1A]/12">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <Eyebrow>Nuestro compromiso</Eyebrow>
        <h2 className="mt-6 max-w-xl font-[family-name:var(--font-voituret-serif)] text-3xl font-light leading-tight sm:text-4xl">
          Cuatro certezas antes de cualquier conversación
        </h2>
        <ol className="mt-14 divide-y divide-[#1A1A1A]/12 border-t border-[#1A1A1A]/12">
          {GUARANTEES.map((item, i) => (
            <li key={item.title} className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-[3rem_1fr_2fr]">
              <span className="font-[family-name:var(--font-voituret-serif)] text-2xl font-light text-[var(--voituret-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-[#1A1A1A]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#1A1A1A]/60">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SelectionCard({ car }: { car: HomeProps["cars"][number] }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  const monthly = listingMonthly(car.price);

  return (
    <Link href={`/inventory/${car.id}`} className="group flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#1A1A1A]/12 bg-[#EFEAE1]">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img
          src={image}
          alt={car.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/45">
          {car.make} · {car.year}
        </p>
      </div>
      <h3 className="mt-2 font-[family-name:var(--font-voituret-serif)] text-xl font-light leading-snug transition-colors group-hover:text-[var(--voituret-accent)]">
        {car.title}
      </h3>
      <p className="mt-3 border-t border-[#1A1A1A]/12 pt-3 text-sm text-[#1A1A1A]/65">
        {car.price}
        {monthly && (
          <span className="text-[#1A1A1A]/40">
            {" "}
            · ${Math.round(monthly).toLocaleString("en-US")}/mes
          </span>
        )}
      </p>
    </Link>
  );
}

function CuratedSelection({
  cars,
  loading,
}: {
  cars: HomeProps["cars"];
  loading: boolean;
}) {
  return (
    <section id="inventory" className="scroll-mt-24">
      <div id="curaduria" className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#1A1A1A]/12 pb-8">
          <div>
            <Eyebrow>Curaduría</Eyebrow>
            <h2 className="mt-6 font-[family-name:var(--font-voituret-serif)] text-3xl font-light sm:text-4xl">
              Selección en exhibición
            </h2>
          </div>
          <VoituretButton href="/inventory" variant="outline">
            Ver todo
          </VoituretButton>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} aria-hidden>
                  <div className="aspect-[4/3] w-full animate-pulse border border-[#1A1A1A]/12 bg-[#1A1A1A]/5" />
                  <div className="mt-5 h-3 w-24 animate-pulse bg-[#1A1A1A]/5" />
                  <div className="mt-3 h-5 w-3/4 animate-pulse bg-[#1A1A1A]/5" />
                </div>
              ))
            : cars.map((car) => <SelectionCard key={car.id} car={car} />)}
        </div>

        {!loading && cars.length === 0 && (
          <p className="mt-16 border border-[#1A1A1A]/12 p-8 text-sm text-[#1A1A1A]/55">
            La colección se está renovando. Vuelve pronto.
          </p>
        )}
      </div>
    </section>
  );
}

function FinancePassage() {
  const [price, setPrice] = useState(48000);
  const [downPayment, setDownPayment] = useState(15000);
  const [term, setTerm] = useState(48);

  const principal = Math.max(0, price - Math.min(downPayment, price));
  const monthly = monthlyPayment(principal, 6.9, term);

  return (
    <section id="financiacion" className="border-y border-[#1A1A1A]/12">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
          <div>
            <Eyebrow>Financiación</Eyebrow>
            <h2 className="mt-6 font-[family-name:var(--font-voituret-serif)] text-3xl font-light leading-tight sm:text-4xl">
              Una estimación discreta
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#1A1A1A]/60">
              Los valores son orientativos y quedan sujetos a aprobación crediticia. Cualquier
              estructura se define en privado con nuestro equipo.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <QuietSlider
              label="Valor de la pieza"
              value={`$${price.toLocaleString("en-US")}`}
              min={20000}
              max={250000}
              step={5000}
              current={price}
              onChange={setPrice}
            />
            <QuietSlider
              label="Entrega inicial"
              value={`$${Math.min(downPayment, price).toLocaleString("en-US")}`}
              min={0}
              max={Math.max(5000, price)}
              step={5000}
              current={Math.min(downPayment, price)}
              onChange={setDownPayment}
            />
            <QuietSlider
              label="Plazo"
              value={`${term} meses`}
              min={12}
              max={72}
              step={12}
              current={term}
              onChange={setTerm}
            />
            <div className="flex items-baseline justify-between border-t border-[#1A1A1A]/20 pt-6">
              <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/50">
                Cuota mensual estimada
              </span>
              <span className="font-[family-name:var(--font-voituret-serif)] text-4xl font-light text-[var(--voituret-accent)]">
                ${Math.round(monthly).toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuietSlider({
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
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/50">
          {label}
        </span>
        <span className="text-sm text-[#1A1A1A]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--voituret-accent)]"
      />
    </div>
  );
}

function ContactBlock() {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "voituret");
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
    <section id="contacto" className="mx-auto max-w-2xl px-6 py-24 sm:px-10">
      <Eyebrow>Contacto</Eyebrow>
      <h2 className="mt-6 font-[family-name:var(--font-voituret-serif)] text-3xl font-light sm:text-4xl">
        Escríbenos
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-[#1A1A1A]/60">
        Dejanos tus datos y un asesor de {logoText} te contacta dentro de un día
        hábil, con la reserva que el caso amerita.
      </p>

      {leadForm.success ? (
        <div className="mt-12 border border-[#1A1A1A]/15 p-8">
          <h3 className="font-[family-name:var(--font-voituret-serif)] text-xl font-light">
            Consulta recibida
          </h3>
          <p className="mt-3 text-sm text-[#1A1A1A]/60">
            Un asesor se comunica a la brevedad.
          </p>
          <button
            type="button"
            onClick={() => leadForm.reset()}
            className="mt-6 rounded-none border border-[#1A1A1A]/30 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#1A1A1A] transition-colors hover:border-[var(--voituret-accent)] hover:text-[var(--voituret-accent)]"
          >
            Enviar otra
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <VoituretField label="Nombre completo">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={voituretControlClass}
              />
            </VoituretField>
            <VoituretField label="Teléfono">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={voituretControlClass}
              />
            </VoituretField>
          </div>

          <VoituretField label="Correo electrónico">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={voituretControlClass}
            />
          </VoituretField>

          <div>
            <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/50">
              Contacto preferido
            </span>
            <div className="flex flex-wrap gap-3">
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredContact(method)}
                  className={`rounded-none px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${
                    preferredContact === method
                      ? "bg-[#1A1A1A] text-[#F6F3EE]"
                      : "border border-[#1A1A1A]/25 text-[#1A1A1A]/65 hover:border-[var(--voituret-accent)]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <VoituretField label="Mensaje">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={voituretControlClass}
              placeholder="Contanos qué pieza te interesa…"
            />
          </VoituretField>

          {leadForm.error && (
            <p className="text-sm font-medium text-[#8A2B2B]">{leadForm.error}</p>
          )}

          <VoituretButton type="submit" disabled={leadForm.submitting}>
            {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
          </VoituretButton>
        </form>
      )}
    </section>
  );
}
