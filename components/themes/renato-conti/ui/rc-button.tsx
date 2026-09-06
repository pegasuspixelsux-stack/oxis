"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type RcButtonProps = {
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

// renato-conti buttons are near-silent editorial marks: no corner radius,
// no fill flourish, a tiny wide-tracked uppercase label with generous
// horizontal padding. `solid` is the single bright block of near-white
// ink used once per section for the primary gesture; `outline` is one
// faint hairline that firms up to full white on hover.
const BASE =
  "inline-flex items-center justify-center rounded-none px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] transition-colors disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid: "bg-[#E8E8E8] text-black hover:bg-[var(--rc-accent)]",
  outline:
    "border border-[#FFFFFF33] text-[#E8E8E8] hover:border-[#E8E8E8]",
} as const;

export function RcButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: RcButtonProps) {
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
