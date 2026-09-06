"use client";

import { useEffect, useState } from "react";
import { estimateListingPayment } from "@/lib/finance";
import type { InventoryListProps } from "@/components/themes/types";
import { RsShell } from "./ui/rs-shell";
import { RsButton } from "./ui/rs-button";
import { RsField, rsControlClass } from "./ui/rs-field";

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
  // leaves the viewer stranded on an empty page.
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
    <RsShell>
      <section id="inventory" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            Inventario
          </h1>
          <p className="mt-2 font-[family-name:var(--font-rs-mono)] text-sm text-white/50">
            {loading
              ? "// cargando telemetría…"
              : `// ${results.length} ${results.length === 1 ? "unidad" : "unidades"} en pista`}
          </p>
        </div>

        {/* Compact top filter strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 border border-white/15 bg-[#0A0A0A] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <RsField label="Palabra clave">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Marca, modelo…"
              className={rsControlClass}
            />
          </RsField>

          <RsField label="Marca">
            <select value={make} onChange={(e) => setMake(e.target.value)} className={rsControlClass}>
              <option value="All">Todas</option>
              {availableMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </RsField>

          <RsField label="Carrocería">
            <select
              value={bodyStyle}
              onChange={(e) => setBodyStyle(e.target.value)}
              className={rsControlClass}
            >
              <option value="All">Todas</option>
              {availableBodyStyles.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </RsField>

          <div>
            <div className="flex items-center justify-between">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                Precio máx.
              </span>
              <span className="font-[family-name:var(--font-rs-mono)] text-sm font-bold text-[var(--rs-accent)]">
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
              className="mt-1 w-full accent-[var(--rs-accent)]"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-white/15 bg-[#0A0A0A]" aria-hidden>
                <div className="aspect-[16/10] animate-pulse bg-white/5" />
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse bg-white/5" />
                  <div className="h-6 w-24 animate-pulse bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-6 flex flex-col items-start gap-4 border border-white/15 bg-[#0A0A0A] p-8">
            <p className="text-base font-bold uppercase tracking-[0.1em] text-white">
              Ninguna unidad coincide con tu búsqueda
            </p>
            <p className="text-sm text-white/50">
              Probá ampliar el rango de precio o quitar algún filtro.
            </p>
            <RsButton onClick={resetFilters} variant="outline">
              Reiniciar filtros
            </RsButton>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((car) => {
                const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
                const monthly = listingMonthly(car.price);
                return (
                  <div
                    key={car.id}
                    className="group flex flex-col border border-white/15 bg-[#0A0A0A] transition-colors hover:border-[var(--rs-accent)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
                      <img
                        src={image}
                        alt={car.title}
                        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                      />
                      <span className="absolute left-0 top-0 bg-[var(--rs-accent)] px-2 py-0.5 font-[family-name:var(--font-rs-mono)] text-[10px] font-bold text-white">
                        {car.make}
                      </span>
                      <span className="absolute right-0 bottom-0 bg-black/80 px-2 py-0.5 font-[family-name:var(--font-rs-mono)] text-[10px] text-white/70">
                        {car.year}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-xs font-bold uppercase leading-snug tracking-[0.05em] text-white">
                        {car.title}
                      </h3>
                      <p className="mt-2 font-[family-name:var(--font-rs-mono)] text-[10px] text-white/40">
                        {car.mileage || "—"} · {car.drivetrain || "—"} · {car.transmission || "—"}
                      </p>
                      <div className="mt-auto flex items-end justify-between pt-3">
                        <div>
                          <span className="block font-[family-name:var(--font-rs-mono)] text-base font-bold text-white">
                            {car.price}
                          </span>
                          {monthly && (
                            <span className="font-[family-name:var(--font-rs-mono)] text-[10px] text-white/40">
                              ${Math.round(monthly).toLocaleString("en-US")}/mes
                            </span>
                          )}
                        </div>
                        <RsButton
                          href={`/inventory/${car.id}`}
                          variant="outline"
                          className="!px-3 !py-1.5 !text-[10px]"
                        >
                          Ficha
                        </RsButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2 font-[family-name:var(--font-rs-mono)]">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-10 w-10 rounded-none border text-xs font-bold transition-colors ${
                        n === currentPage
                          ? "border-[var(--rs-accent)] bg-[var(--rs-accent)] text-white"
                          : "border-white/20 text-white/60 hover:border-[var(--rs-accent)]"
                      }`}
                    >
                      {String(n).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </RsShell>
  );
}
