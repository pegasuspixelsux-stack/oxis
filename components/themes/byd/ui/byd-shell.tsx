"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { bydFontClass } from "../fonts";
import { BydButton } from "./byd-button";

const NAV_LINKS = [
  { href: "#coleccion", label: "Colección" },
  { href: "#rendimiento", label: "Rendimiento" },
  { href: "#contacto", label: "Contacto" },
];

const FOOTER_LINKS = [
  { href: "#top", label: "Inicio" },
  { href: "#coleccion", label: "Colección" },
  { href: "#rendimiento", label: "Rendimiento y eficiencia" },
  { href: "#contacto", label: "Contacto" },
];

// byd page shell: a bright, airy high-tech canvas — crisp white with cool
// slate sections, a thin light top bar and a modern column footer. The
// brand accent CSS variable (electric blue) is set once here so every
// descendant primitive (BydButton "solid" gradient, BydField focus border,
// spec-tile highlights) can read `var(--byd-accent)`.
export function BydShell({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${settings.dealershipName}, quiero una prueba de manejo.`
  );
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <div
      id="top"
      className={`${bydFontClass} flex min-h-screen flex-col bg-white font-[family-name:var(--font-byd-sans)] text-[#0A1A2F]`}
      style={{ "--byd-accent": "#0A84FF" } as CSSProperties}
    >
      <header className="sticky top-0 z-50 border-b border-[#0A1A2F]/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="#top"
            className="flex items-center gap-2.5 font-[family-name:var(--font-byd-display)] text-lg font-bold tracking-tight"
          >
            <span className="inline-block h-2.5 w-2.5 shrink-0 bg-gradient-to-br from-[var(--byd-accent)] to-[#00B4D8]" />
            {settings.dealershipName}
          </Link>

          <nav className="hidden items-center gap-9 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#1E2A38]/70 transition-colors hover:text-[var(--byd-accent)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden rounded-none border border-[#0A1A2F]/15 px-3.5 py-2 text-sm font-medium text-[#0A1A2F] transition-colors hover:border-[var(--byd-accent)] hover:text-[var(--byd-accent)] sm:inline-flex"
            >
              Panel
            </Link>
            <BydButton href="#contacto" className="!px-4 !py-2 !text-xs">
              Reservá una prueba
            </BydButton>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#0A1A2F]/10 bg-[#F1F4F7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="flex items-center gap-2.5 font-[family-name:var(--font-byd-display)] text-lg font-bold tracking-tight">
                <span className="inline-block h-2.5 w-2.5 shrink-0 bg-gradient-to-br from-[var(--byd-accent)] to-[#00B4D8]" />
                {settings.dealershipName}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#1E2A38]/60">
                Movilidad eléctrica con especificaciones transparentes, tecnología a bordo y
                cero fricción en la compra.
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5A6B7D]">
                Navegación
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#1E2A38]/70 transition-colors hover:text-[var(--byd-accent)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5A6B7D]">
                Horario
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-[#1E2A38]/60">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5A6B7D]">
                Dónde estamos
              </h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-[#1E2A38]/60">
                <li>{settings.address}</li>
                <li>
                  <a href={telHref} className="transition-colors hover:text-[var(--byd-accent)]">
                    {settings.phoneNumber}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--byd-accent)] transition-colors hover:text-[#00B4D8]"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-[#0A1A2F]/10 pt-6 text-xs text-[#5A6B7D] sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {settings.dealershipName}. Todos los derechos
              reservados.
            </p>
            <Link href="/login" className="transition-colors hover:text-[#0A1A2F]">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
