"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { rsMotorsFontClass } from "../fonts";

const NAV_LINKS = [
  { href: "#inventory", label: "Inventario" },
  { href: "#finance", label: "Financiación" },
  { href: "#contact", label: "Contacto" },
];

const FOOTER_LINKS = [
  { href: "#top", label: "Inicio" },
  { href: "#inventory", label: "Inventario" },
  { href: "#finance", label: "Calculá tu cuota" },
  { href: "#contact", label: "Contacto" },
];

// rs-motors page shell: carbon-black page, a sharp sticky top bar and a
// hard-edged footer. The brand accent CSS variable is set once here so
// every descendant primitive (RsButton "solid", RsField focus border,
// telemetry accents) can read `var(--rs-accent)`. Data mirrors BMW's
// site-header / site-footer but in the motorsport look: uppercase,
// condensed, diagonal red trim, zero corner radius.
export function RsShell({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${settings.dealershipName}, quiero hacer una consulta.`
  );
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <div
      id="top"
      className={`${rsMotorsFontClass} flex min-h-screen flex-col bg-black font-[family-name:var(--font-rs-display)] text-[#EBEBEB]`}
      style={{ "--rs-accent": "#EE0405" } as CSSProperties}
    >
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="#top"
            className="flex items-center gap-3 text-lg font-bold uppercase tracking-[0.15em] text-white"
          >
            <span className="inline-block h-5 w-1.5 shrink-0 -skew-x-12 bg-[var(--rs-accent)]" />
            {settings.dealershipName}
          </Link>

          <nav className="hidden items-center gap-9 text-[11px] font-bold uppercase tracking-[0.25em] md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/60 transition-colors hover:text-[var(--rs-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="border border-white/30 px-4 py-2 text-white transition-colors hover:border-[var(--rs-accent)] hover:bg-[var(--rs-accent)]"
            >
              Panel
            </Link>
          </nav>

          <a
            href={telHref}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--rs-accent)] md:hidden"
          >
            Llamar
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-[#0A0A0A]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="flex items-center gap-3 text-lg font-bold uppercase tracking-[0.15em] text-white">
                <span className="inline-block h-5 w-1.5 shrink-0 -skew-x-12 bg-[var(--rs-accent)]" />
                {settings.dealershipName}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
                Usados de alto rendimiento con inspección de 150 puntos, precios cerrados y
                garantía de devolución de 7 días.
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
                Navegación
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-xs font-bold uppercase tracking-[0.15em]">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 transition-colors hover:text-[var(--rs-accent)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
                Horario
              </h3>
              <ul className="mt-4 flex flex-col gap-2 font-[family-name:var(--font-rs-mono)] text-sm text-white/50">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
                Visitanos
              </h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-white/50">
                <li>{settings.address}</li>
                <li>
                  <a
                    href={telHref}
                    className="font-[family-name:var(--font-rs-mono)] transition-colors hover:text-white"
                  >
                    {settings.phoneNumber}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold uppercase tracking-[0.15em] text-[var(--rs-accent)] transition-colors hover:text-white"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {settings.dealershipName}. Todos los derechos
              reservados.
            </p>
            <Link href="/login" className="uppercase tracking-[0.25em] hover:text-white/70">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
