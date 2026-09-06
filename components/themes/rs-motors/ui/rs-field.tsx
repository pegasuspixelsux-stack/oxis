import type { ReactNode } from "react";

// Shared control styling for every rs-motors input / select / textarea:
// carbon-black field, hairline white border that lights up red on focus,
// zero corner radius. Kept as a string so a bare <select> or
// <input type="range"> can opt in without a wrapper.
export const rsControlClass =
  "w-full rounded-none border border-white/20 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[var(--rs-accent)]";

export function RsField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}
