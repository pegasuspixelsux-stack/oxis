"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { FilterSelect } from "@/components/inventory/filter-select";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { useShowroom } from "@/components/showroom-context";
import { vehicles, makes, bodyStyles, bodyStyleLabels, priceCeilings, formatPrice } from "@/lib/vehicles";
import { AlertIcon, ChevronDownIcon } from "@/components/icons";

const ALL = "all";

export function InventorySection() {
  const [make, setMake] = useState(ALL);
  const [bodyStyle, setBodyStyle] = useState(ALL);
  const [maxPrice, setMaxPrice] = useState(ALL);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { selectVehicle } = useShowroom();

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (make !== ALL && v.make !== make) return false;
      if (bodyStyle !== ALL && v.bodyStyle !== bodyStyle) return false;
      if (maxPrice !== ALL && v.price > Number(maxPrice)) return false;
      return true;
    });
  }, [make, bodyStyle, maxPrice]);

  const activeCount = [make, bodyStyle, maxPrice].filter((v) => v !== ALL).length;
  const filtersActive = activeCount > 0;

  const handleInquire = (id: string) => {
    selectVehicle(id);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
                {filtered.length} vehículo{filtered.length === 1 ? "" : "s"} disponible
                {filtered.length === 1 ? "" : "s"}
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="mt-8 flex w-full items-center justify-between rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-sm font-medium text-fg transition-colors hover:border-accent sm:w-auto sm:gap-3"
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
                      ...bodyStyles.map((b) => ({ value: b, label: bodyStyleLabels[b] })),
                    ]}
                  />
                  <FilterSelect
                    label="Precio Máximo"
                    value={maxPrice}
                    onValueChange={setMaxPrice}
                    options={[
                      { value: ALL, label: "Cualquier precio" },
                      ...priceCeilings.map((p) => ({ value: String(p), label: `Hasta ${formatPrice(p)}` })),
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
          {filtered.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} onInquire={handleInquire} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong py-16 text-center">
              <AlertIcon className="h-8 w-8 text-fg-subtle" />
              <p className="text-fg-muted">Ningún vehículo coincide con tus filtros.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-accent underline underline-offset-4"
              >
                Limpiar filtros y ver todo
              </button>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="mt-8 text-xs text-fg-subtle">
            *Cuotas estimadas con 10% de anticipo, TNA 6,9% a 60 meses, sujeto a aprobación
            crediticia. La cuota varía según el precio del vehículo y no incluye impuestos ni
            gastos de gestoría.
          </p>
        )}
      </Container>
    </section>
  );
}
