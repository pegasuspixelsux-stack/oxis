"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { estimateListingPayment } from "@/lib/finance";
import type { InventoryListProps } from "@/components/themes/types";
import { VoituretShell } from "./ui/voituret-shell";
import { VoituretButton } from "./ui/voituret-button";
import { VoituretField, voituretControlClass } from "./ui/voituret-field";

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
    <VoituretShell>
      <section id="inventory" className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="border-b border-[#1A1A1A]/12 pb-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[var(--voituret-accent)]">
            La colección
          </p>
          <h1 className="mt-6 font-[family-name:var(--font-voituret-serif)] text-4xl font-light sm:text-5xl">
            Piezas escogidas
          </h1>
          <p className="mt-5 text-sm text-[#1A1A1A]/55">
            {loading
              ? "Preparando la selección…"
              : `${results.length} ${
                  results.length === 1 ? "pieza en exhibición" : "piezas en exhibición"
                }`}
          </p>
        </div>

        {/* Filter row */}
        <div className="mt-10 grid grid-cols-1 gap-8 border-b border-[#1A1A1A]/12 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <VoituretField label="Búsqueda">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Marca, modelo…"
              className={voituretControlClass}
            />
          </VoituretField>

          <VoituretField label="Marca">
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className={voituretControlClass}
            >
              <option value="All">Todas</option>
              {availableMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </VoituretField>

          <VoituretField label="Carrocería">
            <select
              value={bodyStyle}
              onChange={(e) => setBodyStyle(e.target.value)}
              className={voituretControlClass}
            >
              <option value="All">Todas</option>
              {availableBodyStyles.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </VoituretField>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/50">
                Precio máximo
              </span>
              <span className="text-sm text-[#1A1A1A]">${maxPrice.toLocaleString("en-US")}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={Math.max(priceCeiling, 10000)}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--voituret-accent)]"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} aria-hidden>
                <div className="aspect-[4/3] w-full animate-pulse border border-[#1A1A1A]/12 bg-[#1A1A1A]/5" />
                <div className="mt-5 h-3 w-24 animate-pulse bg-[#1A1A1A]/5" />
                <div className="mt-3 h-5 w-3/4 animate-pulse bg-[#1A1A1A]/5" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-16 flex flex-col items-start gap-5 border border-[#1A1A1A]/12 p-10">
            <p className="font-[family-name:var(--font-voituret-serif)] text-2xl font-light">
              Ninguna pieza coincide con tu búsqueda
            </p>
            <p className="text-sm text-[#1A1A1A]/55">
              Probá ampliar el rango de precio o quitar algún filtro.
            </p>
            <VoituretButton onClick={resetFilters} variant="outline">
              Limpiar filtros
            </VoituretButton>
          </div>
        ) : (
          <>
            <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2">
              {visible.map((car) => {
                const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
                const monthly = listingMonthly(car.price);
                return (
                  <Link key={car.id} href={`/inventory/${car.id}`} className="group flex flex-col">
                    <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#1A1A1A]/12 bg-[#EFEAE1]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
                      <img
                        src={image}
                        alt={car.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/45">
                      {car.make} · {car.year} · {car.bodyStyle || "—"}
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-voituret-serif)] text-xl font-light leading-snug transition-colors group-hover:text-[var(--voituret-accent)]">
                      {car.title}
                    </h2>
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
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-20 flex flex-wrap items-center justify-center gap-3">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-10 w-10 rounded-none border text-xs transition-colors ${
                        n === currentPage
                          ? "border-[var(--voituret-accent)] bg-[var(--voituret-accent)] text-white"
                          : "border-[#1A1A1A]/20 text-[#1A1A1A]/60 hover:border-[var(--voituret-accent)]"
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
    </VoituretShell>
  );
}
