"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type FiatButtonProps = {
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

// Fiat buttons are soft pills — the deliberate contrast with MINI's hard
// square corners and BMW's squared edges.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid: "bg-[var(--fiat-accent)] text-white shadow-sm shadow-[#9B1B30]/20",
  outline:
    "border border-[var(--fiat-accent)] text-[var(--fiat-accent)] hover:bg-[var(--fiat-accent)] hover:text-white",
} as const;

export function FiatButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: FiatButtonProps) {
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
