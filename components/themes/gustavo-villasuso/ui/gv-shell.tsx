"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { gvFontClass } from "../fonts";

const NAV_LINKS = [
  { href: "#coleccion", label: "Colección" },
  { href: "#financiacion", label: "Financiación" },
  { href: "#contacto", label: "Contacto" },
];

const FOOTER_LINKS = [
  { href: "#top", label: "Inicio" },
  { href: "#coleccion", label: "Colección" },
  { href: "#financiacion", label: "Financiación" },
  { href: "#contacto", label: "Contacto" },
];

// gustavo-villasuso page shell: a deep-black canvas with a precise top
// bar (dealership name + a BMW · MINI · MAZDA marque line, chrome
// hairline bottom border) and a structured multi-column footer (address,
// hours, phone, WhatsApp). The performance-red accent CSS variable is
// set once here so every descendant primitive (GvButton "solid",
// GvField focus border, spec-panel marks) can read `var(--gv-accent)`.
export function GvShell({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${settings.dealershipName}, quisiera consultar por una unidad de la Colección Villasuso.`
  );
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <div
      id="top"
      className={`${gvFontClass} flex min-h-screen flex-col bg-black font-[family-name:var(--font-gv-body)] text-white`}
      style={{ "--gv-accent": "#D31A2B" } as CSSProperties}
    >
      <header className="sticky top-0 z-50 border-b border-white/15 bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="#top" className="flex items-center gap-3">
            <span className="inline-block h-6 w-[3px] shrink-0 bg-[var(--gv-accent)]" />
            <span className="font-[family-name:var(--font-gv-display)] text-base font-bold uppercase tracking-[0.12em] text-white">
              {settings.dealershipName}
            </span>
          </Link>

          <nav className="hidden items-center gap-8 font-[family-name:var(--font-gv-display)] text-xs font-semibold uppercase tracking-[0.14em] text-white/60 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="rounded-none border border-white/25 px-3.5 py-2 text-white transition-colors hover:border-white"
            >
              Panel
            </Link>
          </nav>

          <span className="hidden font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8CBD0] md:block">
            BMW · MINI · MAZDA
          </span>

          <a
            href={telHref}
            className="rounded-none bg-[var(--gv-accent)] px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white md:hidden"
          >
            Llamar
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/15 bg-[#0B0B0C]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="flex items-center gap-3 font-[family-name:var(--font-gv-display)] text-base font-bold uppercase tracking-[0.12em]">
                <span className="inline-block h-6 w-[3px] shrink-0 bg-[var(--gv-accent)]" />
                {settings.dealershipName}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                Colección Villasuso — selección alemana y japonesa. Rendimiento con
                procedencia. Cada unidad, verificada.
              </p>
              <p className="mt-4 font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8CBD0]">
                BMW · MINI · MAZDA
              </p>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Navegación
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Horario de atención
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-white/60">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Dónde estamos
              </h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-white/60">
                <li>{settings.address}</li>
                <li>
                  <a href={telHref} className="transition-colors hover:text-white">
                    {settings.phoneNumber}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--gv-accent)] transition-colors hover:text-white"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {settings.dealershipName}. Todos los derechos
              reservados.
            </p>
            <Link href="/login" className="transition-colors hover:text-white/70">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
