"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment, estimateListingPayment } from "@/lib/finance";
import type { HomeProps } from "@/components/themes/types";
import { CarmaxShell } from "./ui/carmax-shell";
import { CarmaxButton } from "./ui/carmax-button";
import { CarmaxField, carmaxControlClass } from "./ui/carmax-field";

type Car = HomeProps["cars"][number];

// Copied verbatim from BMW's intro-section copy (hard rule: no imports
// across theme folders). carmax renders these as a plain "¿Por qué
// comprar con nosotros?" value grid, so only the text is kept.
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

const PER_PAGE = 16;
const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80";

type QuickFilter = {
  label: string;
  patch: { bodyStyle?: string; maxPrice?: number; transmission?: string };
};

const QUICK_FILTERS: QuickFilter[] = [
  { label: "Hasta $20.000", patch: { maxPrice: 20000 } },
  { label: "Hasta $40.000", patch: { maxPrice: 40000 } },
  { label: "SUV", patch: { bodyStyle: "SUV" } },
  { label: "Sedán", patch: { bodyStyle: "Sedan" } },
  { label: "Automático", patch: { transmission: "Automatic" } },
];

function numericPrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ""), 10);
}

function listingMonthly(price: string): number | null {
  const numeric = numericPrice(price);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return estimateListingPayment(numeric);
}

export default function HomeHero({
  cars,
  loading,
  availableMakes,
  availableBodyStyles,
  priceCeiling,
  filterCars,
}: HomeProps) {
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("All");
  const [bodyStyle, setBodyStyle] = useState("All");
  const [transmission, setTransmission] = useState("All");
  const [maxPrice, setMaxPrice] = useState(() => Math.max(priceCeiling, 10000));
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (cars.length > 0) setMaxPrice(Math.max(priceCeiling, 10000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.length]);

  useEffect(() => {
    setPage(1);
  }, [search, make, bodyStyle, transmission, maxPrice]);

  const priceCap = Math.max(priceCeiling, 10000);

  // filterCars covers search / make / bodyStyle / maxPrice; transmission
  // is a carmax-only quick filter so it is applied on top of the result.
  const results = useMemo(() => {
    const base = filterCars({
      search,
      make: make === "All" ? undefined : make,
      bodyStyle: bodyStyle === "All" ? undefined : bodyStyle,
      maxPrice,
    });
    return transmission === "All"
      ? base
      : base.filter((car) => car.transmission === transmission);
  }, [filterCars, search, make, bodyStyle, transmission, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function applyQuick(patch: QuickFilter["patch"]) {
    if (patch.bodyStyle) setBodyStyle((v) => (v === patch.bodyStyle ? "All" : patch.bodyStyle!));
    if (patch.transmission)
      setTransmission((v) => (v === patch.transmission ? "All" : patch.transmission!));
    if (typeof patch.maxPrice === "number")
      setMaxPrice((v) => (v === patch.maxPrice ? priceCap : patch.maxPrice!));
  }

  function resetFilters() {
    setSearch("");
    setMake("All");
    setBodyStyle("All");
    setTransmission("All");
    setMaxPrice(priceCap);
  }

  const filtersActive =
    Boolean(search) ||
    make !== "All" ||
    bodyStyle !== "All" ||
    transmission !== "All" ||
    maxPrice !== priceCap;

  return (
    <CarmaxShell>
      {/* Search-first hero */}
      <section className="border-b border-[#16202A]/12 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Encontrá tu próximo vehículo
          </h1>
          <p className="mt-1 text-sm text-[#16202A]/60">
            Buscá entre todo el inventario disponible. Filtrá por marca, tipo y precio.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CarmaxField label="Palabra clave">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Marca, modelo…"
                className={carmaxControlClass}
              />
            </CarmaxField>
            <CarmaxField label="Marca">
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className={carmaxControlClass}
              >
                <option value="All">Todas las marcas</option>
                {availableMakes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </CarmaxField>
            <CarmaxField label="Carrocería">
              <select
                value={bodyStyle}
                onChange={(e) => setBodyStyle(e.target.value)}
                className={carmaxControlClass}
              >
                <option value="All">Todas</option>
                {availableBodyStyles.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </CarmaxField>
            <div>
              <div className="flex items-center justify-between">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/55">
                  Precio máximo
                </span>
                <span className="font-[family-name:var(--font-carmax-mono)] text-xs font-semibold text-[var(--carmax-accent)]">
                  ${maxPrice.toLocaleString("en-US")}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={priceCap}
                step={2500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2.5 w-full accent-[var(--carmax-accent)]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/45">
              Filtros rápidos
            </span>
            {QUICK_FILTERS.map((qf) => {
              const active =
                (qf.patch.bodyStyle && bodyStyle === qf.patch.bodyStyle) ||
                (qf.patch.transmission && transmission === qf.patch.transmission) ||
                (typeof qf.patch.maxPrice === "number" && maxPrice === qf.patch.maxPrice);
              return (
                <button
                  key={qf.label}
                  type="button"
                  onClick={() => applyQuick(qf.patch)}
                  className={`rounded-none border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-[var(--carmax-accent)] bg-[var(--carmax-accent)] text-white"
                      : "border-[#16202A]/20 bg-white text-[#16202A]/70 hover:border-[var(--carmax-accent)]"
                  }`}
                >
                  {qf.label}
                </button>
              );
            })}
            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-none px-2 py-1.5 text-xs font-medium text-[var(--carmax-accent)] underline"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="inventory" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#16202A]/12 pb-4">
          <h2 className="text-lg font-bold tracking-tight">
            {loading
              ? "Cargando vehículos…"
              : `${results.length} ${
                  results.length === 1 ? "vehículo" : "vehículos"
                } disponibles`}
          </h2>
          <CarmaxButton href="/inventory" variant="outline" className="!px-3 !py-1.5 !text-xs">
            Ver búsqueda completa
          </CarmaxButton>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-[#16202A]/12 bg-white" aria-hidden>
                <div className="aspect-[4/3] animate-pulse bg-[#16202A]/5" />
                <div className="flex flex-col gap-2 p-3">
                  <div className="h-3 w-3/4 animate-pulse bg-[#16202A]/5" />
                  <div className="h-4 w-1/2 animate-pulse bg-[#16202A]/5" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-6 flex flex-col items-start gap-3 border border-[#16202A]/12 bg-white p-6">
            <p className="text-sm font-semibold">Ningún vehículo coincide con tu búsqueda</p>
            <p className="text-sm text-[#16202A]/60">
              Probá ampliar el rango de precio o quitar algún filtro.
            </p>
            <CarmaxButton onClick={resetFilters} variant="outline">
              Limpiar filtros
            </CarmaxButton>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((car) => (
                <ResultCard key={car.id} car={car} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onSelect={setPage}
              />
            )}
          </>
        )}
      </section>

      <TradeInModule />
      <FinanceCalculator />
      <ValuePropBlock />
      <ContactCTA />
    </CarmaxShell>
  );
}

function ResultCard({ car }: { car: Car }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  const monthly = listingMonthly(car.price);

  return (
    <article className="flex flex-col border border-[#16202A]/12 bg-white transition-colors hover:border-[var(--carmax-accent)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F5F7]">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img src={image} alt={car.title} className="h-full w-full object-cover" />
        <span className="absolute left-0 top-0 bg-[var(--carmax-accent)] px-2 py-0.5 text-[11px] font-semibold text-white">
          {car.year}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-xs font-semibold leading-snug">{car.title}</h3>
        <p className="mt-1 text-[11px] text-[#16202A]/55">
          {car.mileage || "—"} · {car.transmission || "—"}
        </p>
        <div className="mt-auto pt-3">
          <span className="block font-[family-name:var(--font-carmax-mono)] text-sm font-semibold">
            {car.price}
          </span>
          {monthly && (
            <span className="font-[family-name:var(--font-carmax-mono)] text-[11px] text-[#16202A]/50">
              ${Math.round(monthly).toLocaleString("en-US")}/mes
            </span>
          )}
          <CarmaxButton
            href={`/inventory/${car.id}`}
            className="mt-2 w-full !py-1.5 !text-xs"
          >
            Ver ficha
          </CarmaxButton>
        </div>
      </div>
    </article>
  );
}

function Pagination({
  totalPages,
  currentPage,
  onSelect,
}: {
  totalPages: number;
  currentPage: number;
  onSelect: (n: number) => void;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 font-[family-name:var(--font-carmax-mono)]">
      {Array.from({ length: totalPages }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={`h-9 w-9 rounded-none border text-sm font-medium transition-colors ${
              n === currentPage
                ? "border-[var(--carmax-accent)] bg-[var(--carmax-accent)] text-white"
                : "border-[#16202A]/20 bg-white text-[#16202A]/65 hover:border-[var(--carmax-accent)]"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function TradeInModule() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="permuta" className="border-y border-[#16202A]/12 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold tracking-tight">¿Entregás tu usado en parte de pago?</h2>
        <p className="mt-1 text-sm text-[#16202A]/60">
          Cargá los datos de tu vehículo y un asesor te contacta con una estimación de permuta.
        </p>

        {submitted ? (
          <div className="mt-6 border border-[var(--carmax-accent)]/40 bg-[var(--carmax-accent)]/5 p-5">
            <p className="text-sm font-semibold">Datos recibidos</p>
            <p className="mt-1 text-sm text-[#16202A]/65">
              Un asesor te contactará con una estimación de permuta a la brevedad.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-3 rounded-none border border-[#16202A]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#16202A] transition-colors hover:border-[var(--carmax-accent)]"
            >
              Cargar otro vehículo
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
          >
            <CarmaxField label="Marca">
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                className={carmaxControlClass}
              />
            </CarmaxField>
            <CarmaxField label="Modelo">
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                className={carmaxControlClass}
              />
            </CarmaxField>
            <CarmaxField label="Año">
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                min={1950}
                max={2026}
                className={carmaxControlClass}
              />
            </CarmaxField>
            <CarmaxField label="Kilometraje">
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                required
                min={0}
                className={carmaxControlClass}
              />
            </CarmaxField>
            <CarmaxButton type="submit">Estimar mi permuta</CarmaxButton>
          </form>
        )}
      </div>
    </section>
  );
}

function FinanceCalculator() {
  const [price, setPrice] = useState(25000);
  const [downPayment, setDownPayment] = useState(7000);
  const [apr, setApr] = useState(6.9);
  const [term, setTerm] = useState(60);

  const principal = Math.max(0, price - Math.min(downPayment, price));
  const monthly = monthlyPayment(principal, apr, term);
  const totalCost = monthly * term + Math.min(downPayment, price);

  return (
    <section id="financiacion" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-lg font-bold tracking-tight">Calculá tu cuota</h2>
      <p className="mt-1 text-sm text-[#16202A]/60">
        Valores orientativos. La cuota final queda sujeta a aprobación crediticia.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-px border border-[#16202A]/12 bg-[#16202A]/12 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid grid-cols-1 gap-4 bg-white p-5 sm:grid-cols-2">
          <SliderRow
            label="Precio del vehículo"
            value={`$${price.toLocaleString("en-US")}`}
            min={10000}
            max={200000}
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
            max={25}
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

        <div className="flex flex-col justify-center gap-1 bg-[var(--carmax-accent)] p-5 text-white">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
            Cuota mensual estimada
          </span>
          <span className="font-[family-name:var(--font-carmax-mono)] text-3xl font-semibold">
            ${Math.round(monthly).toLocaleString("en-US")}
          </span>
          <dl className="mt-3 flex flex-col gap-1.5 border-t border-white/25 pt-3 font-[family-name:var(--font-carmax-mono)] text-[11px] text-white/80">
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
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/55">
          {label}
        </span>
        <span className="font-[family-name:var(--font-carmax-mono)] text-xs font-semibold text-[var(--carmax-accent)]">
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
        className="mt-2 w-full accent-[var(--carmax-accent)]"
      />
    </div>
  );
}

function ValuePropBlock() {
  return (
    <section className="border-y border-[#16202A]/12 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold tracking-tight">¿Por qué comprar con nosotros?</h2>
        <div className="mt-6 grid grid-cols-1 gap-px border border-[#16202A]/12 bg-[#16202A]/12 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((item) => (
            <div key={item.title} className="bg-white p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-none bg-[var(--carmax-accent)]/10 text-sm font-semibold text-[var(--carmax-accent)]">
                ✓
              </span>
              <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#16202A]/60">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <CarmaxButton href="#contacto">Hablar con un asesor</CarmaxButton>
        </div>
      </div>
    </section>
  );
}

function ContactCTA() {
  const { settings } = useSettings();
  const { logoText } = resolveThemeSettings(settings, "carmax");
  const leadForm = useLeadForm();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await leadForm.submit({ name, email, phone, preferredContact: "WhatsApp", message });
    } catch {
      /* leadForm.error is set by the hook */
    }
  }

  return (
    <section id="contacto" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-lg font-bold tracking-tight">Escribinos</h2>
      <p className="mt-1 text-sm text-[#16202A]/60">
        Dejanos tus datos y un asesor de {logoText} te contacta dentro de un día
        hábil.
      </p>

      {leadForm.success ? (
        <div className="mt-6 border border-[var(--carmax-accent)]/40 bg-[var(--carmax-accent)]/5 p-5">
          <h3 className="text-sm font-semibold">Consulta enviada</h3>
          <p className="mt-1 text-sm text-[#16202A]/65">
            Ya la recibimos. Un asesor se comunica a la brevedad.
          </p>
          <button
            type="button"
            onClick={() => leadForm.reset()}
            className="mt-3 rounded-none border border-[#16202A]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#16202A] transition-colors hover:border-[var(--carmax-accent)]"
          >
            Enviar otra
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CarmaxField label="Nombre completo">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={carmaxControlClass}
              />
            </CarmaxField>
            <CarmaxField label="Teléfono">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={carmaxControlClass}
              />
            </CarmaxField>
          </div>
          <CarmaxField label="Correo electrónico">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={carmaxControlClass}
            />
          </CarmaxField>
          <CarmaxField label="Mensaje">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={carmaxControlClass}
              placeholder="Contanos qué vehículo estás buscando…"
            />
          </CarmaxField>

          {leadForm.error && (
            <p className="text-sm font-medium text-[#B42318]">{leadForm.error}</p>
          )}

          <CarmaxButton type="submit" disabled={leadForm.submitting}>
            {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
          </CarmaxButton>
        </form>
      )}
    </section>
  );
}
