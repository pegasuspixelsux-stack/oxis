"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type DiforButtonProps = {
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

// difor buttons are square, clear and businesslike: zero corner radius,
// medium weight, sentence case, a calm click target. `solid` is the
// industrial-blue accent fill; `outline` is a slate hairline box that
// picks up the accent border on hover.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid:
    "bg-[var(--difor-accent)] text-white hover:bg-[#173F82]",
  outline:
    "border border-[#1B2733]/20 bg-white text-[#1B2733] hover:border-[var(--difor-accent)] hover:text-[var(--difor-accent)]",
} as const;

export function DiforButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: DiforButtonProps) {
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
