"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { diforFontClass } from "../fonts";

const NAV_LINKS = [
  { href: "#inventory", label: "Inventario" },
  { href: "#financiacion", label: "Financiación" },
  { href: "#contacto", label: "Contacto" },
];

const FOOTER_LINKS = [
  { href: "#top", label: "Inicio" },
  { href: "#inventory", label: "Inventario" },
  { href: "#financiacion", label: "Calculá tu cuota" },
  { href: "#contacto", label: "Contacto" },
];

// difor page shell: a clean white/light-grey page with a structured
// top bar and an informational footer (address, hours, phone, WhatsApp
// plus a short trust line). The brand accent CSS variable is set once
// here so every descendant primitive (DiforButton "solid", DiforField
// focus border, verified badges) can read `var(--difor-accent)`.
export function DiforShell({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { logoText, address } = resolveThemeSettings(settings, "difor");
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${logoText}, quiero hacer una consulta.`
  );
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <div
      id="top"
      className={`${diforFontClass} flex min-h-screen flex-col bg-[#F5F7FA] font-[family-name:var(--font-difor-sans)] text-[#1B2733]`}
      style={{ "--difor-accent": "#1E4FA3" } as CSSProperties}
    >
      <header className="sticky top-0 z-50 border-b border-[#1B2733]/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="#top" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span className="inline-block h-6 w-1.5 shrink-0 bg-[var(--difor-accent)]" />
            {logoText}
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#1B2733]/70 transition-colors hover:text-[var(--difor-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="rounded-none border border-[#1B2733]/20 px-3.5 py-2 text-[#1B2733] transition-colors hover:border-[var(--difor-accent)] hover:text-[var(--difor-accent)]"
            >
              Panel
            </Link>
          </nav>

          <a
            href={telHref}
            className="rounded-none bg-[var(--difor-accent)] px-3.5 py-2 text-sm font-medium text-white md:hidden"
          >
            Llamar
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#1B2733]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
                <span className="inline-block h-6 w-1.5 shrink-0 bg-[var(--difor-accent)]" />
                {logoText}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#1B2733]/60">
                Concesionaria multimarca con inspección verificada de 150 puntos, precios
                transparentes y financiación clara en cada unidad.
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#1F8B3F]">
                <span aria-hidden>✓</span> Inspección verificada en todo el inventario
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#1B2733]/45">
                Navegación
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#1B2733]/70 transition-colors hover:text-[var(--difor-accent)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#1B2733]/45">
                Horario de atención
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-[#1B2733]/60">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#1B2733]/45">
                Dónde estamos
              </h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-[#1B2733]/60">
                <li>{address}</li>
                <li>
                  <a href={telHref} className="transition-colors hover:text-[var(--difor-accent)]">
                    {settings.phoneNumber}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--difor-accent)] transition-colors hover:text-[#173F82]"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-[#1B2733]/10 pt-6 text-xs text-[#1B2733]/45 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {logoText}. Todos los derechos
              reservados.
            </p>
            <Link href="/login" className="transition-colors hover:text-[#1B2733]/70">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
