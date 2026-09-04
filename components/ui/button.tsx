"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-hover shadow-[0_0_0_1px_rgba(255,255,0,0.4)]",
  secondary:
    "bg-transparent text-fg border border-border-strong hover:border-accent hover:text-accent",
  ghost: "bg-transparent text-fg-muted hover:text-fg",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: ReactNode;
};

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

type ButtonAsButton = CommonProps & NativeButtonProps & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    children,
    variant = "primary",
    size = "md",
    className = "",
    icon,
    ...rest
  } = props;

  const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, external } = rest as ButtonAsLink;
    return (
      <motion.span
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.015 }}
        className={`inline-block ${className}`}
      >
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={classes}
        >
          {children}
          {icon}
        </Link>
      </motion.span>
    );
  }

  const buttonRest = rest as NativeButtonProps;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.015 }}
      className={classes}
      {...buttonRest}
    >
      {children}
      {icon}
    </motion.button>
  );
}
