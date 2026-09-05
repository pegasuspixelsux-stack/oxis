import type { ReactNode } from "react";

// Shared control styling for every MINI input / select / textarea: thick
// black border, square corners, accent focus ring. Kept as a string so a
// bare <select> or <input type="range"> can opt in without a wrapper.
export const miniControlClass =
  "w-full border-2 border-neutral-950 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition-colors focus:border-[var(--mini-accent)]";

export function MiniField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-widest text-neutral-950">
        {label}
      </span>
      {children}
    </label>
  );
}
