"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";
import { estimateListingPayment } from "@/lib/finance";
import { Container } from "@/components/themes/bmw/ui/container";
import { Reveal } from "@/components/reveal";
import { FilterSelect } from "@/components/themes/bmw/inventory/filter-select";
import { AlertIcon, ChevronDownIcon, ArrowRightIcon, DrivetrainIcon, TransmissionIcon } from "@/components/icons";

const ALL = "all";
const HOMEPAGE_DISPLAY_LIMIT = 6;

export function InventorySection() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [make, setMake] = useState(ALL);
  const [bodyStyle, setBodyStyle] = useState(ALL);
  const [maxPrice, setMaxPrice] = useState(ALL);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchCars() {
      try {
        const snap = await getDocs(query(collection(db, CARS_COLLECTION), orderBy("createdAt", "desc")));
        if (!cancelled) setCars(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Car));
      } catch (err) {
        console.error("[inventory-section] failed to load cars", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCars();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter options and price ceiling are derived from real inventory data
  // (same reasoning as the /inventory page's Advanced Search) instead of a
  // hardcoded list, so a make/body style never silently becomes unselectable.
  const makes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.make).filter(Boolean))).sort(),
    [cars]
  );
  const bodyStyles = useMemo(
    () => Array.from(new Set(cars.map((c) => c.bodyStyle).filter(Boolean))).sort(),
    [cars]
  );
  const priceCeilings = useMemo(() => {
    const prices = cars
      .map((c) => parseInt(String(c.price).replace(/[^0-9]/g, ""), 10))
      .filter((p) => Number.isFinite(p) && p > 0);
    if (prices.length === 0) return [];
    const max = Math.ceil(Math.max(...prices) / 10000) * 10000;
    const steps = [20000, 30000, 50000, 75000, 100000].filter((s) => s < max);
    return [...steps, max];
  }, [cars]);

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      if (make !== ALL && car.make !== make) return false;
      if (bodyStyle !== ALL && car.bodyStyle !== bodyStyle) return false;
      if (maxPrice !== ALL) {
        const numericPrice = parseInt(String(car.price).replace(/[^0-9]/g, ""), 10);
        if (Number.isFinite(numericPrice) && numericPrice > Number(maxPrice)) return false;
      }
      return true;
    });
  }, [cars, make, bodyStyle, maxPrice]);

  const activeCount = [make, bodyStyle, maxPrice].filter((v) => v !== ALL).length;
  const filtersActive = activeCount > 0;
  const displayed = filtered.slice(0, HOMEPAGE_DISPLAY_LIMIT);
  const hasMore = filtered.length > HOMEPAGE_DISPLAY_LIMIT;

  const resetFilters = () => {
    setMake(ALL);
    setBodyStyle(ALL);
    setMaxPrice(ALL);
  };

  return (
    <section id="inventory" className="relative border-t border-border py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-sm uppercase sm:text-xs tracking-[0.2em] text-accent">
                Inventario Actual
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                {loading
                  ? "Cargando inventario…"
                  : `${filtered.length} vehículo${filtered.length === 1 ? "" : "s"} disponible${filtered.length === 1 ? "" : "s"}`}
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="mt-8 flex w-full items-center justify-between rounded-none border border-border-strong bg-bg-elevated px-4 py-3 text-sm font-medium text-fg transition-colors hover:border-accent sm:w-auto sm:gap-3"
          >
            <span className="flex items-center gap-2">
              Filtros
              {filtersActive && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-xs text-accent">
                  {activeCount}
                </span>
              )}
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 text-fg-muted transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FilterSelect
                    label="Marca"
                    value={make}
                    onValueChange={setMake}
                    options={[
                      { value: ALL, label: "Todas las marcas" },
                      ...makes.map((m) => ({ value: m, label: m })),
                    ]}
                  />
                  <FilterSelect
                    label="Carrocería"
                    value={bodyStyle}
                    onValueChange={setBodyStyle}
                    options={[
                      { value: ALL, label: "Todas las carrocerías" },
                      ...bodyStyles.map((b) => ({ value: b, label: b })),
                    ]}
                  />
                  <FilterSelect
                    label="Precio Máximo"
                    value={maxPrice}
                    onValueChange={setMaxPrice}
                    options={[
                      { value: ALL, label: "Cualquier precio" },
                      ...priceCeilings.map((p) => ({
                        value: String(p),
                        label: `Hasta $${p.toLocaleString("en-US")}`,
                      })),
                    ]}
                  />
                </div>

                {filtersActive && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 text-sm font-medium text-fg-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-accent"
                  >
                    Limpiar filtros
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>

        <div className="mt-10">
          {displayed.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {displayed.map((car) => (
                  <FeaturedCarCard key={car.id} car={car} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : !loading ? (
            <div className="flex flex-col items-center gap-3 rounded-none border border-dashed border-border-strong py-16 text-center">
              <AlertIcon className="h-8 w-8 text-fg-subtle" />
              <p className="text-fg-muted">
                {filtersActive ? "Ningún vehículo coincide con tus filtros." : "Todavía no hay vehículos publicados."}
              </p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-medium text-accent underline underline-offset-4"
                >
                  Limpiar filtros y ver todo
                </button>
              )}
            </div>
          ) : null}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex justify-center">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 rounded-none border border-border-strong bg-bg-elevated px-5 py-3 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
            >
              {hasMore
                ? `Ver los ${filtered.length} vehículos del inventario completo`
                : "Ver inventario completo"}
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        {filtered.length > 0 && (
          <p className="mt-8 text-xs text-fg-subtle">
            *Cuotas estimadas con 30% de anticipo, TNA 6,9% a 60 meses, sujeto a aprobación
            crediticia. La cuota varía según el precio del vehículo y no incluye impuestos ni
            gastos de gestoría.
          </p>
        )}
      </Container>
    </section>
  );
}

function FeaturedCarCard({ car }: { car: Car }) {
  const cover = car.images?.[0] || car.img || "";
  const numericPrice = parseInt(String(car.price).replace(/[^0-9]/g, ""), 10);
  const monthlyEstimate =
    Number.isFinite(numericPrice) && numericPrice > 0 ? estimateListingPayment(numericPrice) : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      <Link
        href={`/inventory/${car.id}`}
        className="group flex flex-col overflow-hidden rounded-none border border-border bg-bg-elevated transition-colors hover:border-border-strong"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg">
          {cover && (
            <Image
              src={cover}
              alt={car.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">{car.make}</p>
          <h3 className="mt-0.5 text-base font-medium text-fg">{car.title}</h3>

          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <TransmissionIcon className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
              <span className="truncate font-mono">{car.mileage}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <DrivetrainIcon className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
              <span className="truncate font-mono">{car.drivetrain}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <div>
              {monthlyEstimate ? (
                <>
                  <span className="font-mono text-xl font-semibold text-fg">
                    ${Math.round(monthlyEstimate).toLocaleString("en-US")}
                    <span className="text-sm font-normal text-fg-muted">/mes*</span>
                  </span>
                  <p className="mt-0.5 text-xs text-fg-subtle">o {car.price}</p>
                </>
              ) : (
                <span className="font-mono text-xl font-semibold text-fg">{car.price}</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-none px-3 py-2 text-sm font-medium text-accent transition-colors group-hover:bg-accent-soft">
              Ver ficha
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
