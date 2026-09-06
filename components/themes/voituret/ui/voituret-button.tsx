"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type VoituretButtonProps = {
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

// voituret buttons are restrained editorial marks: no corner radius, no
// fill flourish, a small wide-tracked uppercase label. `solid` is the
// near-black ink block used once per section for the primary action;
// `outline` is a single charcoal hairline that takes the metallic accent
// on hover.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid: "bg-[#1A1A1A] text-[#F6F3EE] hover:bg-[var(--voituret-accent)]",
  outline:
    "border border-[#1A1A1A]/30 text-[#1A1A1A] hover:border-[var(--voituret-accent)] hover:text-[var(--voituret-accent)]",
} as const;

export function VoituretButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: VoituretButtonProps) {
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
