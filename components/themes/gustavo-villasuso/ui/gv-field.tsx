import type { ReactNode } from "react";

// Shared control styling for every gustavo-villasuso input / select /
// textarea: near-black field, chrome hairline border that turns
// performance-red on focus, zero corner radius. Kept as a string so a
// bare <select> or <input type="range"> can opt in without a wrapper.
export const gvControlClass =
  "w-full rounded-none border border-white/15 bg-[#0B0B0C] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--gv-accent)]";

export function GvField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#C8CBD0]">
        {label}
      </span>
      {children}
    </label>
  );
}
