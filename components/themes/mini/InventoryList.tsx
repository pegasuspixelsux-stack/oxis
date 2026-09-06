"use client";

import { useEffect, useMemo, useState } from "react";
import { MiniShell } from "./ui/mini-shell";
import { MiniButton } from "./ui/mini-button";
import { MiniField, miniControlClass } from "./ui/mini-field";
import type { InventoryListProps } from "@/components/themes/types";

const PAGE_SIZE = 12;
const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";

export default function InventoryList({
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
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [page, setPage] = useState(1);

  // Snap the price slider to the real ceiling once inventory arrives.
  useEffect(() => {
    if (cars.length > 0) setMaxPrice(priceCeiling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.length]);

  // Any filter change resets to page 1 so a narrowed result set never
  // strands the shopper on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, make, bodyStyle, maxPrice]);

  const results = filterCars({
    search,
    make: make === "All" ? undefined : make,
    bodyStyle: bodyStyle === "All" ? undefined : bodyStyle,
    maxPrice,
  });

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  function resetFilters() {
    setSearch("");
    setMake("All");
    setBodyStyle("All");
    setMaxPrice(priceCeiling);
  }

  return (
    <MiniShell>
      <section id="inventory" className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter sm:text-6xl">
            Inventario
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            {loading
              ? "Cargando vehículos…"
              : `${results.length} ${results.length === 1 ? "vehículo" : "vehículos"} disponibles.`}
          </p>

          {/* Horizontal filter bar */}
          <div className="mt-8 grid grid-cols-1 gap-5 border-2 border-neutral-950 p-6 md:grid-cols-2 lg:grid-cols-4">
            <MiniField label="Palabra clave">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Marca, modelo…"
                className={miniControlClass}
              />
            </MiniField>

            <MiniField label="Marca">
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className={miniControlClass}
              >
                <option value="All">Todas</option>
                {availableMakes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </MiniField>

            <MiniField label="Carrocería">
              <select
                value={bodyStyle}
                onChange={(e) => setBodyStyle(e.target.value)}
                className={miniControlClass}
              >
                <option value="All">Todas</option>
                {availableBodyStyles.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </MiniField>

            <div>
              <div className="flex items-center justify-between">
                <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-widest text-neutral-950">
                  Precio máx.
                </span>
                <span className="text-sm font-extrabold text-[var(--mini-accent)]">
                  ${maxPrice.toLocaleString("en-US")}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={priceCeiling}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--mini-accent)]"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-2 border-neutral-950 bg-white" aria-hidden>
                  <div className="aspect-[4/3] animate-pulse border-b-2 border-neutral-950 bg-neutral-200" />
                  <div className="flex flex-col gap-3 p-5">
                    <div className="h-3 w-16 animate-pulse bg-neutral-200" />
                    <div className="h-5 w-3/4 animate-pulse bg-neutral-200" />
                    <div className="mt-4 h-7 w-24 animate-pulse bg-neutral-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="mt-10 flex flex-col items-start gap-5 border-2 border-neutral-950 p-10">
              <p className="text-lg font-extrabold uppercase tracking-tight">
                Ningún MINI coincide con tu búsqueda
              </p>
              <MiniButton onClick={resetFilters} variant="outline">
                Reiniciar filtros
              </MiniButton>
            </div>
          ) : (
            <>
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((car) => {
                  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
                  return (
                    <div key={car.id} className="flex flex-col border-2 border-neutral-950 bg-white">
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
                          <MiniButton
                            href={`/inventory/${car.id}`}
                            variant="outline"
                            className="!px-4 !py-2 !text-xs"
                          >
                            Ver
                          </MiniButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center gap-2">
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={page === n ? "page" : undefined}
                      className={`h-11 w-11 border-2 border-neutral-950 text-sm font-extrabold transition-colors ${
                        page === n
                          ? "bg-[var(--mini-accent)] text-white"
                          : "bg-white text-neutral-950 hover:bg-neutral-100"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </MiniShell>
  );
}
