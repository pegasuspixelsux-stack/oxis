import type { ReactNode } from "react";

// Shared control styling for every renato-conti input / select / textarea:
// an underline-only field — no box, a single faint hairline along the
// baseline that turns solid white on focus, zero corner radius. Kept as a
// string so a bare <select> or <input type="range"> can opt in without a
// wrapper.
export const rcControlClass =
  "w-full rounded-none border-0 border-b border-[#FFFFFF29] bg-transparent px-0 py-3 text-sm text-[#E8E8E8] outline-none transition-colors focus:border-[#E8E8E8] placeholder:text-[#5A5A5A]";

export function RcField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-[10px] uppercase tracking-[0.28em] text-[#8C8C8C]">
        {label}
      </span>
      {children}
    </label>
  );
}
