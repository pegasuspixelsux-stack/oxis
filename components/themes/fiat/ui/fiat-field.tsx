import type { ReactNode } from "react";

// Shared control styling for every Fiat input / select / textarea: soft
// hairline border, rounded-xl corners, white field on the cream page,
// warm-red focus border. Kept as a string so a bare <select> or
// <input type="range"> can opt in without a wrapper.
export const fiatControlClass =
  "w-full rounded-xl border border-[#1a1a1a]/15 bg-white px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[var(--fiat-accent)]";

export function FiatField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#1a1a1a]/70">
        {label}
      </span>
      {children}
    </label>
  );
}
