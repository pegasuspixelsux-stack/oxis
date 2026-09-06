"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { estimateListingPayment } from "@/lib/finance";
import type { InventoryListProps } from "@/components/themes/types";
import { RcShell } from "./ui/rc-shell";
import { RcButton } from "./ui/rc-button";
import { RcField, rcControlClass } from "./ui/rc-field";

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
    <RcShell>
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-12">
        <div className="border-b border-[#FFFFFF14] pb-12">
          <p className="font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.4em] text-[#8C8C8C]">
            Black Edition
          </p>
          <h1 className="mt-8 font-[family-name:var(--font-rc-display)] text-4xl font-light uppercase tracking-[0.15em] text-[#E8E8E8] sm:text-5xl">
            Piezas seleccionadas
          </h1>
          <p className="mt-6 text-sm text-[#8C8C8C]">
            {loading
              ? "Preparando la curaduría…"
              : `${results.length} ${results.length === 1 ? "pieza" : "piezas"} en exhibición`}
          </p>
        </div>

        {/* Filter row */}
        <div className="mt-12 grid grid-cols-1 gap-10 border-b border-[#FFFFFF14] pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <RcField label="Búsqueda">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Marca, modelo…"
              className={rcControlClass}
            />
          </RcField>

          <RcField label="Marca">
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className={`${rcControlClass} [&>option]:bg-black`}
            >
              <option value="All">Todas</option>
              {availableMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </RcField>

          <RcField label="Carrocería">
            <select
              value={bodyStyle}
              onChange={(e) => setBodyStyle(e.target.value)}
              className={`${rcControlClass} [&>option]:bg-black`}
            >
              <option value="All">Todas</option>
              {availableBodyStyles.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </RcField>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="mb-2 block font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.28em] text-[#8C8C8C]">
                Precio máximo
              </span>
              <span className="text-sm tabular-nums text-[#E8E8E8]">
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
              className="mt-3 w-full accent-[var(--rc-accent)]"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="mt-20 grid grid-cols-1 gap-x-16 gap-y-24 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} aria-hidden className="flex flex-col gap-4">
                <div className="aspect-[4/5] w-full animate-pulse border border-[#FFFFFF14] bg-[#FFFFFF0A]" />
                <div className="mt-2 h-2 w-24 animate-pulse bg-[#FFFFFF0A]" />
                <div className="h-3 w-3/4 animate-pulse bg-[#FFFFFF0A]" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-20 flex flex-col items-start gap-6 border border-[#FFFFFF14] p-12">
            <p className="font-[family-name:var(--font-rc-display)] text-2xl font-light uppercase tracking-[0.12em] text-[#E8E8E8]">
              Ninguna pieza coincide con la búsqueda.
            </p>
            <p className="text-sm text-[#8C8C8C]">
              Amplíe el rango de precio o quite algún filtro.
            </p>
            <RcButton onClick={resetFilters} variant="outline">
              Limpiar filtros
            </RcButton>
          </div>
        ) : (
          <>
            <div className="mt-20 grid grid-cols-1 gap-x-16 gap-y-24 sm:grid-cols-2">
              {visible.map((car) => {
                const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
                const monthly = listingMonthly(car.price);
                return (
                  <Link key={car.id} href={`/inventory/${car.id}`} className="group flex flex-col">
                    <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#FFFFFF14] bg-[#0A0A0A]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
                      <img
                        src={image}
                        alt={car.title}
                        className="h-full w-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100"
                      />
                    </div>
                    <p className="mt-6 font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.3em] text-[#8C8C8C]">
                      {car.make} · {car.year} · {car.bodyStyle || "—"}
                    </p>
                    <h2 className="mt-3 font-[family-name:var(--font-rc-display)] text-lg font-light uppercase tracking-[0.12em] text-[#E8E8E8] transition-colors group-hover:text-[var(--rc-accent)]">
                      {car.title}
                    </h2>
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
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-24 flex flex-wrap items-center justify-center gap-3">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-10 w-10 rounded-none border text-[11px] tabular-nums transition-colors ${
                        n === currentPage
                          ? "border-[#E8E8E8] bg-[#E8E8E8] text-black"
                          : "border-[#FFFFFF29] text-[#8C8C8C] hover:border-[#E8E8E8] hover:text-[#E8E8E8]"
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
    </RcShell>
  );
}
