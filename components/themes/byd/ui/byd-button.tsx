"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type BydButtonProps = {
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

// byd buttons are crisp squared product-CTA pills: zero corner radius,
// semibold, tight. `solid` is a cyan→blue gradient fill in the electric
// accent; `outline` is a hairline slate box that lights up to the accent
// on hover.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-sm font-semibold tracking-tight transition-colors disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid:
    "bg-[var(--byd-accent)] bg-gradient-to-r from-[var(--byd-accent)] to-[#00B4D8] text-white hover:opacity-90",
  outline:
    "border border-[#0A1A2F]/20 bg-white text-[#0A1A2F] hover:border-[var(--byd-accent)] hover:text-[var(--byd-accent)]",
} as const;

export function BydButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: BydButtonProps) {
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
