"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type GvButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  /** Render an <a target="_blank"> instead of a Next <Link> (only with href). */
  external?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

// gustavo-villasuso buttons are precise, engineered marks: zero corner
// radius, a tight wide-tracked uppercase label, generous horizontal
// padding. `solid` is the single performance-red block used once per
// section for the primary gesture; `outline` is a chrome hairline box
// that firms up to full white on hover.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid: "bg-[var(--gv-accent)] text-white hover:bg-[#B31624]",
  outline: "border border-white/25 text-white hover:border-white",
} as const;

export function GvButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: GvButtonProps) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
