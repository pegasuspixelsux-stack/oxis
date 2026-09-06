import type { ReactNode } from "react";

// Shared control styling for every carmax input / select / textarea:
// white field, thin ink border that turns marketplace-blue on focus,
// zero corner radius. Kept as a string so a bare <select> or
// <input type="number"> can opt in without a wrapper.
export const carmaxControlClass =
  "w-full rounded-none border border-[#16202A]/20 bg-white px-3 py-2 text-sm text-[#16202A] outline-none transition-colors placeholder:text-[#16202A]/40 focus:border-[var(--carmax-accent)]";

export function CarmaxField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/55">
        {label}
      </span>
      {children}
    </label>
  );
}
