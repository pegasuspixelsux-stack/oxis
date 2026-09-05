"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type RsButtonProps = {
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

// rs-motors buttons are hard-edged race decals: zero corner radius,
// uppercase, heavy, wide tracking. The deliberate contrast with Fiat's
// pills. `solid` is the red accent fill; `outline` is a hairline box that
// inverts to the accent on hover.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid: "bg-[var(--rs-accent)] text-white hover:bg-white hover:text-black",
  outline:
    "border border-white/30 text-white hover:border-[var(--rs-accent)] hover:bg-[var(--rs-accent)]",
} as const;

export function RsButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: RsButtonProps) {
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
