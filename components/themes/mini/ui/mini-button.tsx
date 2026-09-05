"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type MiniButtonProps = {
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

const BASE =
  "inline-flex items-center justify-center gap-2 border-2 px-6 py-3 text-sm font-extrabold uppercase tracking-widest transition-transform active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  solid: "border-[var(--mini-accent)] bg-[var(--mini-accent)] text-white",
  outline:
    "border-neutral-950 bg-transparent text-neutral-950 hover:bg-neutral-950 hover:text-white",
} as const;

export function MiniButton({
  children,
  href,
  onClick,
  variant = "solid",
  external = false,
  type = "button",
  disabled = false,
  className = "",
}: MiniButtonProps) {
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
