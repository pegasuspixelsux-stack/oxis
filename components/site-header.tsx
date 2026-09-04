"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PhoneIcon, MenuIcon, CloseIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "#inventory", label: "Inventario" },
  { href: "#about", label: "Nosotros" },
  { href: "#tools", label: "Financiación y Canje" },
  { href: "#contact", label: "Contacto" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-lg transition-colors duration-300 ${
        scrolled
          ? "bg-bg/85 border-b border-border"
          : "bg-bg/25 border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="#top"
          className="text-lg font-semibold tracking-tight text-fg"
          onClick={() => setOpen(false)}
        >
          OXIS <span className="text-logo-accent">AUTO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-fg-muted">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-fg">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+59826001234"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-fg-muted transition-colors hover:text-accent"
          >
            <PhoneIcon className="h-4 w-4" />
            +598 2600 1234
          </a>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-strong text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="md:hidden overflow-hidden border-b border-border bg-bg/95 backdrop-blur-md"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-fg transition-colors hover:bg-bg-elevated"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="tel:+59826001234"
                className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-accent"
              >
                <PhoneIcon className="h-4 w-4" />
                Llamar +598 2600 1234
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
