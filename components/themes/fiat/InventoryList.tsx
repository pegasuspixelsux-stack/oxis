"use client";

import { useEffect, useState } from "react";
import { estimateListingPayment } from "@/lib/finance";
import type { InventoryListProps } from "@/components/themes/types";
import { FiatShell } from "./ui/fiat-shell";
import { FiatButton } from "./ui/fiat-button";
import { FiatField, fiatControlClass } from "./ui/fiat-field";

const PAGE_STEP = 9;
const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";

function listingMonthly(price: string): number | null {
  const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return estimateListingPayment(numeric);
}

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
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  // Snap the price slider to the real ceiling once inventory arrives.
  useEffect(() => {
    if (cars.length > 0) setMaxPrice(priceCeiling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars.length]);

  // Any filter change collapses the list back to the first page so a
  // narrowed result set never leaves a stale "load more" tail.
  useEffect(() => {
    setVisibleCount(PAGE_STEP);
  }, [search, make, bodyStyle, maxPrice]);

  const results = filterCars({
    search,
    make: make === "All" ? undefined : make,
    bodyStyle: bodyStyle === "All" ? undefined : bodyStyle,
    maxPrice,
  });

  const visible = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  function resetFilters() {
    setSearch("");
    setMake("All");
    setBodyStyle("All");
    setMaxPrice(priceCeiling);
  }

  return (
    <FiatShell>
      <section id="inventory" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Inventario</h1>
        <p className="mt-2 text-sm text-[#1a1a1a]/60">
          {loading
            ? "Cargando vehículos…"
            : `${results.length} ${results.length === 1 ? "vehículo" : "vehículos"} disponibles.`}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Compact left rail */}
          <aside className="flex h-max flex-col gap-4 rounded-xl border border-[#1a1a1a]/10 bg-white p-4 shadow-sm lg:sticky lg:top-20">
            <FiatField label="Palabra clave">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Marca, modelo…"
                className={fiatControlClass}
              />
            </FiatField>

            <FiatField label="Marca">
              <select value={make} onChange={(e) => setMake(e.target.value)} className={fiatControlClass}>
                <option value="All">Todas</option>
                {availableMakes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </FiatField>

            <FiatField label="Carrocería">
              <select
                value={bodyStyle}
                onChange={(e) => setBodyStyle(e.target.value)}
                className={fiatControlClass}
              >
                <option value="All">Todas</option>
                {availableBodyStyles.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </FiatField>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1a1a1a]/70">Precio máx.</span>
                <span className="text-sm font-bold text-[var(--fiat-accent)]">
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
                className="mt-2 w-full accent-[var(--fiat-accent)]"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="text-left text-xs font-semibold text-[#1a1a1a]/50 transition-colors hover:text-[var(--fiat-accent)]"
            >
              Limpiar filtros
            </button>
          </aside>

          {/* Results */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-[#1a1a1a]/10 bg-white"
                    aria-hidden
                  >
                    <div className="aspect-[4/3] animate-pulse bg-[#EDE4D6]" />
                    <div className="flex flex-col gap-2 p-4">
                      <div className="h-3 w-14 animate-pulse rounded bg-[#EDE4D6]" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-[#EDE4D6]" />
                      <div className="mt-3 h-6 w-20 animate-pulse rounded bg-[#EDE4D6]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-xl border border-[#1a1a1a]/10 bg-white p-8 shadow-sm">
                <p className="text-base font-bold">Ningún vehículo coincide con tu búsqueda</p>
                <p className="text-sm text-[#1a1a1a]/60">
                  Probá ampliar el rango de precio o quitar algún filtro.
                </p>
                <FiatButton onClick={resetFilters} variant="outline">
                  Reiniciar filtros
                </FiatButton>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((car) => {
                    const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
                    const monthly = listingMonthly(car.price);
                    return (
                      <div
                        key={car.id}
                        className="flex flex-col overflow-hidden rounded-xl border border-[#1a1a1a]/10 bg-white shadow-sm transition-shadow hover:shadow-md"
                      >
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
                              <span className="block text-lg font-extrabold tracking-tight">
                                {car.price}
                              </span>
                              {monthly && (
                                <span className="text-xs text-[#1a1a1a]/50">
                                  desde ${Math.round(monthly).toLocaleString("en-US")}/mes
                                </span>
                              )}
                            </div>
                            <FiatButton
                              href={`/inventory/${car.id}`}
                              variant="outline"
                              className="!px-3.5 !py-1.5 !text-xs"
                            >
                              Ver
                            </FiatButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <FiatButton
                      variant="outline"
                      onClick={() => setVisibleCount((c) => c + PAGE_STEP)}
                    >
                      Ver más vehículos
                    </FiatButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </FiatShell>
  );
}
