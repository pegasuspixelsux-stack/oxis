import type { ReactNode } from "react";

// Shared control styling for every voituret input / select / textarea:
// an underline-only field — no box, a single charcoal hairline along the
// baseline that turns to the metallic accent on focus, zero corner
// radius. Kept as a string so a bare <select> or <input type="range">
// can opt in without a wrapper.
export const voituretControlClass =
  "w-full rounded-none border-0 border-b border-[#1A1A1A]/25 bg-transparent px-0 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#1A1A1A]/35 focus:border-[var(--voituret-accent)]";

export function VoituretField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/50">
        {label}
      </span>
      {children}
    </label>
  );
}
