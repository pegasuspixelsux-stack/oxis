"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Container } from "@/components/themes/bmw/ui/container";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/themes/bmw/ui/button";
import { PillGroup } from "@/components/themes/bmw/ui/pill-group";
import { useShowroom } from "@/components/showroom-context";
import { vehicles, formatPrice } from "@/lib/vehicles";
import { monthlyPayment, estimateTradeInRange, type Condition } from "@/lib/finance";

const TERMS = [36, 48, 60, 72];
const CONDITIONS: Condition[] = ["Excellent", "Good", "Fair"];
const CONDITION_LABELS: Record<Condition, string> = {
  Excellent: "Excelente",
  Good: "Bueno",
  Fair: "Regular",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClasses =
  "h-12 w-full rounded-none border border-border-strong bg-bg-elevated px-4 text-sm text-fg outline-none transition-colors focus:border-accent";

type Tab = "calc" | "trade";

const TAB_LABELS: Record<Tab, string> = {
  calc: "Calculadora",
  trade: "Canje",
};

export function FinanceToolsSection() {
  const { selectedVehicleId } = useShowroom();
  const [activeTab, setActiveTab] = useState<Tab>("calc");

  const [price, setPrice] = useState(32000);
  const [downPayment, setDownPayment] = useState(3000);
  const [apr, setApr] = useState(6.9);
  const [term, setTerm] = useState(60);

  const [tradeYear, setTradeYear] = useState(new Date().getFullYear() - 5);
  const [tradeMileage, setTradeMileage] = useState(65000);
  const [tradeCondition, setTradeCondition] = useState<Condition>("Good");
  const [tradeEstimate, setTradeEstimate] = useState<{ low: number; high: number } | null>(null);

  // Sync the calculator's price when a new vehicle is selected from the inventory
  // grid. Adjusting state during render (rather than in an effect) avoids an
  // extra commit — see https://react.dev/learn/you-might-not-need-an-effect.
  const [syncedVehicleId, setSyncedVehicleId] = useState<string | null>(null);
  if (selectedVehicleId && selectedVehicleId !== syncedVehicleId) {
    setSyncedVehicleId(selectedVehicleId);
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (vehicle) setPrice(vehicle.price);
  }

  const principal = Math.max(0, price - downPayment);
  const payment = useMemo(() => monthlyPayment(principal, apr, term), [principal, apr, term]);

  const handleEstimate = () => {
    setTradeEstimate(
      estimateTradeInRange({ year: tradeYear, mileage: tradeMileage, condition: tradeCondition })
    );
  };

  const applyTradeIn = () => {
    if (!tradeEstimate) return;
    const midpoint = Math.round((tradeEstimate.low + tradeEstimate.high) / 2);
    setDownPayment((current) => current + midpoint);
  };

  return (
    <section id="tools" className="relative border-t border-border py-20 sm:py-28">
      <Container>
        <Reveal>
          <p className="font-mono text-sm uppercase sm:text-xs tracking-[0.2em] text-accent">
            Financiación y Canje
          </p>
          <h2 className="mt-3 max-w-lg text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Conocé tus números antes de venir.
          </h2>
        </Reveal>

        <div className="mt-10 lg:hidden">
          <PillGroup
            options={["calc", "trade"] as Tab[]}
            value={activeTab}
            onChange={setActiveTab}
            format={(t) => TAB_LABELS[t]}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-2">
          <Reveal delay={0.05} className={activeTab === "calc" ? "block" : "hidden lg:block"}>
            <div className="flex h-full flex-col rounded-none border border-border bg-bg-elevated p-6 sm:p-8">
              <h3 className="text-lg font-medium text-fg">Calculadora de cuotas</h3>
              <p className="mt-1 text-sm text-fg-muted">
                Ajustá los plazos para ver una cuota mensual estimada.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Field label="Precio del vehículo">
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={inputClasses}
                  />
                </Field>
                <Field label="Anticipo + canje">
                  <input
                    type="number"
                    min={0}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className={inputClasses}
                  />
                </Field>
                <Field label="TNA %">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={apr}
                    onChange={(e) => setApr(Number(e.target.value))}
                    className={inputClasses}
                  />
                </Field>
                <Field label="Plazo">
                  <div className="flex h-12 items-center">
                    <PillGroup options={TERMS} value={term} onChange={setTerm} format={(t) => `${t} m.`} />
                  </div>
                </Field>
              </div>

              <div className="mt-auto pt-8">
                <div className="rounded-none bg-accent-soft p-5">
                  <p className="font-mono text-sm uppercase sm:text-xs tracking-wider text-accent">
                    Cuota mensual estimada
                  </p>
                  <p className="mt-1 font-mono text-3xl font-semibold text-fg">
                    {formatPrice(Math.round(payment))}
                    <span className="text-base font-normal text-fg-muted"> /mes</span>
                  </p>
                </div>
                <p className="mt-3 text-xs text-fg-subtle">
                  Solo estimativo. No incluye impuestos ni gastos de gestoría — la tasa final
                  está sujeta a aprobación crediticia.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className={activeTab === "trade" ? "block" : "hidden lg:block"}>
            <div className="flex h-full flex-col rounded-none border border-border bg-bg-elevated p-6 sm:p-8">
              <h3 className="text-lg font-medium text-fg">Estimador de valor de canje</h3>
              <p className="mt-1 text-sm text-fg-muted">
                Obtené un rango estimado al instante para tu vehículo actual.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Field label="Año del modelo">
                  <input
                    type="number"
                    min={1980}
                    max={new Date().getFullYear()}
                    value={tradeYear}
                    onChange={(e) => setTradeYear(Number(e.target.value))}
                    className={inputClasses}
                  />
                </Field>
                <Field label="Kilometraje">
                  <input
                    type="number"
                    min={0}
                    value={tradeMileage}
                    onChange={(e) => setTradeMileage(Number(e.target.value))}
                    className={inputClasses}
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Estado">
                    <PillGroup
                      options={CONDITIONS}
                      value={tradeCondition}
                      onChange={setTradeCondition}
                      format={(c) => CONDITION_LABELS[c]}
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="secondary" onClick={handleEstimate} className="w-full sm:w-auto">
                  Obtener estimación instantánea
                </Button>
              </div>

              <div className="mt-auto pt-8">
                {tradeEstimate ? (
                  <>
                    <div className="rounded-none bg-accent-soft p-5">
                      <p className="font-mono text-sm uppercase sm:text-xs tracking-wider text-accent">
                        Rango estimado de canje
                      </p>
                      <p className="mt-1 font-mono text-2xl font-semibold text-fg">
                        {formatPrice(tradeEstimate.low)} &ndash; {formatPrice(tradeEstimate.high)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-fg-subtle">
                        La oferta final se determina con una tasación presencial.
                      </p>
                      <button
                        type="button"
                        onClick={applyTradeIn}
                        className="shrink-0 text-sm font-medium text-accent underline underline-offset-4"
                      >
                        Aplicar a la calculadora
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-fg-subtle">
                    Ingresá los datos de tu vehículo para ver un rango estimado.
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
