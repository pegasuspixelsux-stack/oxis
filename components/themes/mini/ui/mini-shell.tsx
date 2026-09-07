"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { miniFontClass } from "../fonts";

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

// MINI page shell: sticky black-bordered top bar + dark footer, with the
// brand accent CSS variable set once here so every descendant primitive
// (MiniButton "solid", MiniField focus ring, roundel bullets) can read
// `var(--mini-accent)`. Data mirrors BMW's site-header / site-footer but
// in the MINI look: uppercase, 2px borders, roundel motif.
export function MiniShell({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { logoText, address } = resolveThemeSettings(settings, "mini");
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${logoText}, quiero hacer una consulta.`
  );
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <div
      id="top"
      className={`${miniFontClass} flex min-h-screen flex-col bg-white font-[family-name:var(--font-mini)] text-neutral-950`}
      style={{ "--mini-accent": "#E10057" } as CSSProperties}
    >
      <header className="sticky top-0 z-50 border-b-2 border-neutral-950 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="#top"
            className="flex items-center gap-2.5 text-lg font-extrabold uppercase tracking-tight"
          >
            <span className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-neutral-950 bg-[var(--mini-accent)]" />
            {logoText}
          </Link>

          <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-widest md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[var(--mini-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="border-2 border-neutral-950 px-3 py-1.5 transition-colors hover:bg-neutral-950 hover:text-white"
            >
              Panel
            </Link>
          </nav>

          <a
            href={telHref}
            className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-[var(--mini-accent)] md:hidden"
          >
            Llamar
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t-2 border-neutral-950 bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="flex items-center gap-2.5 text-lg font-extrabold uppercase tracking-tight">
                <span className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-white bg-[var(--mini-accent)]" />
                {logoText}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-300">
                Usados certificados con precios transparentes, inspección de 150 puntos y
                garantía de devolución de 7 días.
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-500">
                Navegación
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm font-bold uppercase tracking-wide">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-neutral-200 transition-colors hover:text-[var(--mini-accent)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-500">
                Horario
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-neutral-300">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-500">
                Visitanos
              </h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-neutral-300">
                <li>{address}</li>
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
                    className="font-bold uppercase tracking-wide text-[var(--mini-accent)] transition-colors hover:text-white"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t-2 border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {logoText}. Todos los derechos
              reservados.
            </p>
            <Link href="/login" className="uppercase tracking-widest hover:text-neutral-300">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
