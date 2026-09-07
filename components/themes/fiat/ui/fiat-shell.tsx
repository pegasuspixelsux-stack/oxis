"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { fiatFontClass } from "../fonts";

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

// Fiat page shell: warm cream page, a slim top bar and a soft footer.
// The brand accent CSS variable is set once here so every descendant
// primitive (FiatButton "solid", FiatField focus border, check bullets)
// can read `var(--fiat-accent)`. Data mirrors BMW's site-header /
// site-footer but in the Fiat look: rounded, compact, humanist.
export function FiatShell({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { logoText, address } = resolveThemeSettings(settings, "fiat");
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${logoText}, quiero hacer una consulta.`
  );
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <div
      id="top"
      className={`${fiatFontClass} flex min-h-screen flex-col bg-[#FBF7F0] font-[family-name:var(--font-fiat)] text-[#1a1a1a]`}
      style={{ "--fiat-accent": "#9B1B30" } as CSSProperties}
    >
      <header className="sticky top-0 z-50 border-b border-[#1a1a1a]/10 bg-[#FBF7F0]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="#top" className="flex items-center gap-2 text-base font-extrabold tracking-tight">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fiat-accent)]" />
            {logoText}
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#1a1a1a]/70 transition-colors hover:text-[var(--fiat-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="rounded-full border border-[#1a1a1a]/20 px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-[var(--fiat-accent)] hover:text-[var(--fiat-accent)]"
            >
              Panel
            </Link>
          </nav>

          <a
            href={telHref}
            className="text-xs font-semibold text-[var(--fiat-accent)] md:hidden"
          >
            Llamar
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-8 border-t border-[#1a1a1a]/10 bg-[#F3ECE0]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="flex items-center gap-2 text-base font-extrabold tracking-tight">
                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--fiat-accent)]" />
                {logoText}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#1a1a1a]/60">
                Usados certificados con precios transparentes, inspección de 150 puntos y
                garantía de devolución de 7 días.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">
                Navegación
              </h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#1a1a1a]/70 transition-colors hover:text-[var(--fiat-accent)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">
                Horario
              </h3>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-[#1a1a1a]/60">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">
                Visitanos
              </h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-[#1a1a1a]/60">
                <li>{address}</li>
                <li>
                  <a href={telHref} className="transition-colors hover:text-[#1a1a1a]">
                    {settings.phoneNumber}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--fiat-accent)] transition-colors hover:text-[#1a1a1a]"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-[#1a1a1a]/10 pt-6 text-xs text-[#1a1a1a]/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {logoText}. Todos los derechos
              reservados.
            </p>
            <Link href="/login" className="hover:text-[#1a1a1a]/70">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
