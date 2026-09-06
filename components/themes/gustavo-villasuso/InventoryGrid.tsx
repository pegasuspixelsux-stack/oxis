"use client";

import { useEffect, useMemo, useState } from "react";
import { estimateListingPayment } from "@/lib/finance";
import type { InventoryListProps } from "@/components/themes/types";
import { GvShell } from "./ui/gv-shell";
import { GvButton } from "./ui/gv-button";
import { GvField, gvControlClass } from "./ui/gv-field";

const PER_PAGE = 12;
const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80";

const SORT_OPTIONS = [
  { value: "featured", label: "Orden de la colección" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "year-desc", label: "Año: más nuevo primero" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function numericPrice(price: string): number {
  const n = parseInt(price.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function listingMonthly(price: string): number | null {
  const numeric = numericPrice(price);
  if (numeric <= 0) return null;
  return estimateListingPayment(numeric);
}

export default function InventoryGrid({
  loading,
  availableMakes,
  availableBodyStyles,
  priceCeiling,
  filterCars,
  cars,
}: InventoryListProps) {
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("All");
  const [bodyStyle, setBodyStyle] = useState("All");
  const [maxPrice, setMaxPrice] = useState(() => Math.max(priceCeiling, 10000));
  const [sort, setSort] = useState<SortValue>("featured");
  const [page, setPage] = useState(1);

  // Snap the price ceiling to the real inventory maximum once it arrives.
  useEffect(() => {
    if (cars.length > 0) setMaxPrice(Math.max(priceCeiling, 10000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.length]);

  // Any filter change resets pagination so a narrowed result set never
  // strands the viewer on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, make, bodyStyle, maxPrice, sort]);

  const filtered = filterCars({
    search,
    make: make === "All" ? undefined : make,
    bodyStyle: bodyStyle === "All" ? undefined : bodyStyle,
    maxPrice,
  });

  const results = useMemo(() => {
    const list = [...filtered];
    if (sort === "price-asc") list.sort((a, b) => numericPrice(a.price) - numericPrice(b.price));
    else if (sort === "price-desc")
      list.sort((a, b) => numericPrice(b.price) - numericPrice(a.price));
    else if (sort === "year-desc") list.sort((a, b) => b.year - a.year);
    return list;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function resetFilters() {
    setSearch("");
    setMake("All");
    setBodyStyle("All");
    setMaxPrice(Math.max(priceCeiling, 10000));
    setSort("featured");
  }

  return (
    <GvShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="border-b border-white/15 pb-6">
          <p className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8CBD0]">
            Colección Villasuso
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-gv-display)] text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
            Inventario
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {loading
              ? "Cargando unidades…"
              : `${results.length} ${
                  results.length === 1 ? "unidad disponible" : "unidades disponibles"
                } · selección alemana y japonesa verificada`}
          </p>
        </div>

        {/* Filter bar */}
        <div className="mt-8 grid grid-cols-1 gap-4 border border-white/15 bg-[#0B0B0C] p-5 sm:grid-cols-2 lg:grid-cols-5">
          <GvField label="Palabra clave">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Marca, modelo…"
              className={gvControlClass}
            />
          </GvField>

          <GvField label="Marca">
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className={gvControlClass}
            >
              <option value="All">Todas</option>
              {availableMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </GvField>

          <GvField label="Carrocería">
            <select
              value={bodyStyle}
              onChange={(e) => setBodyStyle(e.target.value)}
              className={gvControlClass}
            >
              <option value="All">Todas</option>
              {availableBodyStyles.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </GvField>

          <div>
            <div className="flex items-center justify-between">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#C8CBD0]">
                Precio máximo
              </span>
              <span className="font-[family-name:var(--font-gv-display)] text-sm font-semibold text-white">
                ${maxPrice.toLocaleString("en-US")}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={Math.max(priceCeiling, 10000)}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--gv-accent)]"
            />
          </div>

          <GvField label="Ordenar">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className={gvControlClass}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </GvField>
        </div>

        {/* Results */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-white/15 bg-[#0B0B0C]" aria-hidden>
                  <div className="aspect-[16/10] animate-pulse bg-white/5" />
                  <div className="flex flex-col gap-3 p-5">
                    <div className="h-4 w-3/4 animate-pulse bg-white/5" />
                    <div className="h-3 w-full animate-pulse bg-white/5" />
                    <div className="h-6 w-24 animate-pulse bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-start gap-4 border border-white/15 bg-[#0B0B0C] p-8">
              <span className="inline-block h-2 w-8 bg-[var(--gv-accent)]" />
              <p className="font-[family-name:var(--font-gv-display)] text-base font-semibold uppercase tracking-wide text-white">
                Ninguna unidad coincide con la búsqueda.
              </p>
              <p className="text-sm text-white/55">
                Probá ampliar el rango de precio o quitar algún filtro.
              </p>
              <GvButton onClick={resetFilters} variant="outline">
                Limpiar filtros
              </GvButton>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((car) => {
                  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
                  const monthly = listingMonthly(car.price);
                  return (
                    <article
                      key={car.id}
                      className="flex flex-col border border-white/15 bg-[#0B0B0C] transition-colors hover:border-white/40"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
                        <img src={image} alt={car.title} className="h-full w-full object-cover" />
                        <span className="absolute left-0 top-0 bg-black/80 px-2.5 py-1 font-[family-name:var(--font-gv-display)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8CBD0]">
                          {car.make}
                        </span>
                        <span className="absolute bottom-0 right-0 bg-[var(--gv-accent)] px-2 py-0.5 font-[family-name:var(--font-gv-display)] text-[10px] font-semibold uppercase tracking-wide text-white">
                          {car.year}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-[family-name:var(--font-gv-display)] text-sm font-semibold uppercase leading-snug tracking-wide text-white">
                          {car.title}
                        </h3>
                        <p className="mt-3 border-t border-white/10 pt-3 text-xs uppercase tracking-wide text-white/55">
                          {car.mileage || "—"} · {car.transmission || "—"} · {car.drivetrain || "—"}
                        </p>
                        <div className="mt-auto flex items-end justify-between pt-4">
                          <div>
                            <span className="block font-[family-name:var(--font-gv-display)] text-base font-bold text-white">
                              {car.price}
                            </span>
                            {monthly && (
                              <span className="text-[11px] text-[var(--gv-accent)]">
                                ${Math.round(monthly).toLocaleString("en-US")}/mes
                              </span>
                            )}
                          </div>
                          <GvButton
                            href={`/inventory/${car.id}`}
                            variant="outline"
                            className="!px-3 !py-1.5 !text-[11px]"
                          >
                            Ver ficha
                          </GvButton>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2 font-[family-name:var(--font-gv-display)]">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const n = i + 1;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`h-10 w-10 rounded-none border text-sm font-semibold transition-colors ${
                          n === currentPage
                            ? "border-[var(--gv-accent)] bg-[var(--gv-accent)] text-white"
                            : "border-white/25 text-white/60 hover:border-white"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </GvShell>
  );
}
