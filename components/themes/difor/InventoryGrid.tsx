"use client";

import { useEffect, useState } from "react";
import { estimateListingPayment } from "@/lib/finance";
import type { InventoryListProps } from "@/components/themes/types";
import { DiforShell } from "./ui/difor-shell";
import { DiforButton } from "./ui/difor-button";
import { DiforField, diforControlClass } from "./ui/difor-field";

const PER_PAGE = 12;
const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80";

function listingMonthly(price: string): number | null {
  const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
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
  }, [search, make, bodyStyle, maxPrice]);

  const results = filterCars({
    search,
    make: make === "All" ? undefined : make,
    bodyStyle: bodyStyle === "All" ? undefined : bodyStyle,
    maxPrice,
  });

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function resetFilters() {
    setSearch("");
    setMake("All");
    setBodyStyle("All");
    setMaxPrice(Math.max(priceCeiling, 10000));
  }

  return (
    <DiforShell>
      <section id="inventory" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-[#1B2733]/10 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Inventario</h1>
          <p className="mt-2 text-sm text-[#1B2733]/60">
            {loading
              ? "Cargando vehículos…"
              : `${results.length} ${
                  results.length === 1 ? "vehículo disponible" : "vehículos disponibles"
                } · inspección verificada de 150 puntos`}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Filter panel */}
          <aside className="h-max border border-[#1B2733]/12 bg-white p-5 lg:sticky lg:top-20">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1B2733]/55">
              Filtros
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <DiforField label="Palabra clave">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Marca, modelo…"
                  className={diforControlClass}
                />
              </DiforField>

              <DiforField label="Marca">
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className={diforControlClass}
                >
                  <option value="All">Todas</option>
                  {availableMakes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </DiforField>

              <DiforField label="Carrocería">
                <select
                  value={bodyStyle}
                  onChange={(e) => setBodyStyle(e.target.value)}
                  className={diforControlClass}
                >
                  <option value="All">Todas</option>
                  {availableBodyStyles.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </DiforField>

              <div>
                <div className="flex items-center justify-between">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#1B2733]/55">
                    Precio máximo
                  </span>
                  <span className="font-[family-name:var(--font-difor-mono)] text-sm font-semibold text-[var(--difor-accent)]">
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
                  className="mt-1 w-full accent-[var(--difor-accent)]"
                />
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-none border border-[#1B2733]/20 bg-white px-4 py-2 text-sm font-medium text-[#1B2733] transition-colors hover:border-[var(--difor-accent)] hover:text-[var(--difor-accent)]"
              >
                Limpiar filtros
              </button>
            </div>
          </aside>

          {/* Results */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-[#1B2733]/12 bg-white" aria-hidden>
                    <div className="aspect-[16/10] animate-pulse bg-[#1B2733]/5" />
                    <div className="flex flex-col gap-3 p-5">
                      <div className="h-4 w-3/4 animate-pulse bg-[#1B2733]/5" />
                      <div className="h-12 w-full animate-pulse bg-[#1B2733]/5" />
                      <div className="h-6 w-24 animate-pulse bg-[#1B2733]/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-start gap-4 border border-[#1B2733]/12 bg-white p-8">
                <p className="text-base font-semibold">Ningún vehículo coincide con tu búsqueda</p>
                <p className="text-sm text-[#1B2733]/60">
                  Probá ampliar el rango de precio o quitar algún filtro.
                </p>
                <DiforButton onClick={resetFilters} variant="outline">
                  Limpiar filtros
                </DiforButton>
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
                        className="flex flex-col border border-[#1B2733]/12 bg-white transition-colors hover:border-[var(--difor-accent)]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F7FA]">
                          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
                          <img src={image} alt={car.title} className="h-full w-full object-cover" />
                          <span className="absolute left-0 top-0 bg-[var(--difor-accent)] px-2 py-0.5 text-xs font-medium text-white">
                            {car.make}
                          </span>
                          <span className="absolute bottom-0 right-0 bg-white/90 px-2 py-0.5 font-[family-name:var(--font-difor-mono)] text-[11px] text-[#1B2733]/70">
                            {car.year}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-sm font-semibold leading-snug">{car.title}</h3>
                          <span className="mt-2 inline-flex w-max items-center gap-1.5 rounded-none border border-[#1F8B3F]/30 bg-[#1F8B3F]/10 px-2 py-0.5 text-[11px] font-medium text-[#1F8B3F]">
                            <span aria-hidden>✓</span> Inspección verificada
                          </span>
                          <p className="mt-3 border-t border-[#1B2733]/10 pt-3 text-xs text-[#1B2733]/60">
                            {car.mileage || "—"} · {car.transmission || "—"} ·{" "}
                            {car.drivetrain || "—"}
                          </p>
                          <div className="mt-auto flex items-end justify-between pt-4">
                            <div>
                              <span className="block font-[family-name:var(--font-difor-mono)] text-base font-semibold">
                                {car.price}
                              </span>
                              {monthly && (
                                <span className="font-[family-name:var(--font-difor-mono)] text-[11px] text-[#1B2733]/50">
                                  ${Math.round(monthly).toLocaleString("en-US")}/mes
                                </span>
                              )}
                            </div>
                            <DiforButton
                              href={`/inventory/${car.id}`}
                              variant="outline"
                              className="!px-3 !py-1.5 !text-xs"
                            >
                              Ver ficha
                            </DiforButton>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-2 font-[family-name:var(--font-difor-mono)]">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const n = i + 1;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={`h-10 w-10 rounded-none border text-sm font-medium transition-colors ${
                            n === currentPage
                              ? "border-[var(--difor-accent)] bg-[var(--difor-accent)] text-white"
                              : "border-[#1B2733]/20 bg-white text-[#1B2733]/65 hover:border-[var(--difor-accent)]"
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
        </div>
      </section>
    </DiforShell>
  );
}
