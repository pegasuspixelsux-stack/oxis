import type { ReactNode } from "react";

// Shared control styling for every difor input / select / textarea:
// white field, thin slate border that turns industrial blue on focus,
// zero corner radius. Kept as a string so a bare <select> or
// <input type="range"> can opt in without a wrapper.
export const diforControlClass =
  "w-full rounded-none border border-[#1B2733]/15 bg-white px-3.5 py-2.5 text-sm text-[#1B2733] outline-none transition-colors placeholder:text-[#1B2733]/40 focus:border-[var(--difor-accent)]";

export function DiforField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#1B2733]/55">
        {label}
      </span>
      {children}
    </label>
  );
}
