"use client";

import { useEffect, useMemo, useState } from "react";
import { estimateListingPayment } from "@/lib/finance";
import type { InventoryListProps } from "@/components/themes/types";
import { CarmaxShell } from "./ui/carmax-shell";
import { CarmaxButton } from "./ui/carmax-button";
import { CarmaxField, carmaxControlClass } from "./ui/carmax-field";

type Car = InventoryListProps["cars"][number];

const PER_PAGE = 16;
const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80";

const SORTS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "year-desc", label: "Año: más nuevo" },
  { value: "mileage-asc", label: "Kilometraje: menor" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

function numericPrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ""), 10);
}

function numericMileage(mileage: string): number {
  const n = parseInt(mileage.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function listingMonthly(price: string): number | null {
  const numeric = numericPrice(price);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return estimateListingPayment(numeric);
}

function sortCars(cars: Car[], sort: Sort): Car[] {
  if (sort === "relevance") return cars;
  const copy = [...cars];
  copy.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return numericPrice(a.price) - numericPrice(b.price);
      case "price-desc":
        return numericPrice(b.price) - numericPrice(a.price);
      case "year-desc":
        return b.year - a.year;
      case "mileage-asc":
        return numericMileage(a.mileage) - numericMileage(b.mileage);
      default:
        return 0;
    }
  });
  return copy;
}

export default function InventoryGrid({
  cars,
  loading,
  availableMakes,
  availableBodyStyles,
  priceCeiling,
  filterCars,
}: InventoryListProps) {
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("All");
  const [bodyStyle, setBodyStyle] = useState("All");
  const [maxPrice, setMaxPrice] = useState(() => Math.max(priceCeiling, 10000));
  const [sort, setSort] = useState<Sort>("relevance");
  const [page, setPage] = useState(1);

  const priceCap = Math.max(priceCeiling, 10000);

  // Snap the price ceiling to the real inventory maximum once it arrives.
  useEffect(() => {
    if (cars.length > 0) setMaxPrice(Math.max(priceCeiling, 10000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.length]);

  useEffect(() => {
    setPage(1);
  }, [search, make, bodyStyle, maxPrice, sort]);

  const results = useMemo(() => {
    const filtered = filterCars({
      search,
      make: make === "All" ? undefined : make,
      bodyStyle: bodyStyle === "All" ? undefined : bodyStyle,
      maxPrice,
    });
    return sortCars(filtered, sort);
  }, [filterCars, search, make, bodyStyle, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function resetFilters() {
    setSearch("");
    setMake("All");
    setBodyStyle("All");
    setMaxPrice(priceCap);
    setSort("relevance");
  }

  return (
    <CarmaxShell>
      <section id="inventory" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-b border-[#16202A]/12 pb-4">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Comprar un vehículo</h1>
          <p className="mt-1 text-sm text-[#16202A]/60">
            {loading
              ? "Cargando vehículos…"
              : `${results.length} ${
                  results.length === 1 ? "resultado" : "resultados"
                }`}
          </p>
        </div>

        {/* Horizontal filter bar — above the grid on desktop, stacked on mobile */}
        <div className="mt-5 grid grid-cols-1 gap-3 border border-[#16202A]/12 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
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
              <option value="All">Todas</option>
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
                Precio máx.
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
          <CarmaxField label="Ordenar por">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className={carmaxControlClass}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </CarmaxField>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
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
              {visible.map((car) => {
                const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
                const monthly = listingMonthly(car.price);
                return (
                  <article
                    key={car.id}
                    className="flex flex-col border border-[#16202A]/12 bg-white transition-colors hover:border-[var(--carmax-accent)]"
                  >
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
                        {car.mileage || "—"} · {car.transmission || "—"} · {car.bodyStyle || "—"}
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
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 font-[family-name:var(--font-carmax-mono)]">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
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
            )}
          </>
        )}
      </section>
    </CarmaxShell>
  );
}
