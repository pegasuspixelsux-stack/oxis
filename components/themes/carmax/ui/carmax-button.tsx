"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type CarmaxButtonProps = {
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

// carmax buttons are utilitarian marketplace controls: zero corner
// radius, compact padding, semibold label, a fast colour transition.
// `solid` is the marketplace accent fill; `outline` is a hairline box
// that picks up the accent on hover.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-4 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid: "bg-[var(--carmax-accent)] text-white hover:bg-[#0A559E]",
  outline:
    "border border-[#16202A]/25 bg-white text-[#16202A] hover:border-[var(--carmax-accent)] hover:text-[var(--carmax-accent)]",
} as const;

export function CarmaxButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: CarmaxButtonProps) {
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
