export function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
  format,
}: {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-accent text-accent-fg"
                : "border border-border-strong text-fg-muted hover:border-accent hover:text-accent"
            }`}
          >
            {format ? format(option) : String(option)}
          </button>
        );
      })}
    </div>
  );
}
