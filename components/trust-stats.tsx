const STATS = [
  { label: "Vehículos Entregados", value: "500+" },
  { label: "Calificación Promedio", value: "4.9★" },
  { label: "Puntos de Inspección", value: "150" },
];

export function TrustStats({ className = "" }: { className?: string }) {
  return (
    <dl className={`flex flex-wrap items-stretch gap-x-8 gap-y-5 ${className}`}>
      {STATS.map((stat, i) => (
        <div key={stat.label} className="flex items-center gap-6 sm:gap-8">
          <div>
            <dt className="font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
              {stat.label}
            </dt>
            <dd className="mt-1 text-7xl font-light tracking-tight text-fg sm:text-5xl sm:font-semibold">
              {stat.value}
            </dd>
          </div>
          {i < STATS.length - 1 && (
            <span className="hidden w-px self-stretch bg-border sm:block" aria-hidden="true" />
          )}
        </div>
      ))}
    </dl>
  );
}
