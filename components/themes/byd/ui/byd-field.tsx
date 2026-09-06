import type { ReactNode } from "react";

// Shared control styling for every byd input / select / textarea: white
// field, thin slate border that turns electric-blue on focus, zero corner
// radius. Kept as a string so a bare <select> or <input type="range"> can
// opt in without a wrapper.
export const bydControlClass =
  "w-full rounded-none border border-[#0A1A2F]/15 bg-white px-3.5 py-2.5 text-sm text-[#0A1A2F] outline-none transition-colors placeholder:text-[#5A6B7D]/60 focus:border-[var(--byd-accent)]";

export function BydField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#5A6B7D]">
        {label}
      </span>
      {children}
    </label>
  );
}
