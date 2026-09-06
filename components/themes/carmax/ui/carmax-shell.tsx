"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { carmaxFontClass } from "../fonts";

const NAV_LINKS = [
  { href: "/inventory", label: "Comprar" },
  { href: "/#permuta", label: "Permuta" },
  { href: "/#financiacion", label: "Financiación" },
  { href: "/#contacto", label: "Contacto" },
];

const FOOTER_LINKS = [
  { href: "/inventory", label: "Ver todo el inventario" },
  { href: "/#permuta", label: "Estimá tu permuta" },
  { href: "/#financiacion", label: "Calculá tu cuota" },
  { href: "/#contacto", label: "Hablar con un asesor" },
];

// carmax page shell: a functional marketplace chrome — a compact
// utilitarian top bar with the dealership name, primary nav and a phone
// CTA, then the page content, then a dense informational footer (address,
// hours, phone, WhatsApp, quick links). The brand accent CSS variable is
// set once here so every descendant primitive can read
// `var(--carmax-accent)`.
export function CarmaxShell({ children }: { children: ReactNode }) {
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
      className={`${carmaxFontClass} flex min-h-screen flex-col bg-[#F4F5F7] font-[family-name:var(--font-carmax-sans)] text-[#16202A]`}
      style={{ "--carmax-accent": "#0B63CE" } as CSSProperties}
    >
      <header className="sticky top-0 z-50 border-b border-[#16202A]/12 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold uppercase tracking-tight"
          >
            <span className="inline-block h-5 w-5 shrink-0 bg-[var(--carmax-accent)]" />
            {settings.dealershipName}
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#16202A]/70 transition-colors hover:text-[var(--carmax-accent)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <a
            href={telHref}
            className="rounded-none bg-[var(--carmax-accent)] px-3 py-2 text-xs font-semibold text-white sm:text-sm"
          >
            {settings.phoneNumber || "Llamar"}
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#16202A]/12 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="flex items-center gap-2 text-base font-bold uppercase tracking-tight">
                <span className="inline-block h-5 w-5 shrink-0 bg-[var(--carmax-accent)]" />
                {settings.dealershipName}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#16202A]/60">
                Miles de vehículos usados y 0km en un solo lugar. Buscá, compará precios y
                reservá online.
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/45">
                Accesos rápidos
              </h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#16202A]/70 transition-colors hover:text-[var(--carmax-accent)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/45">
                Horario de atención
              </h3>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-[#16202A]/60">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#16202A]/45">
                Dónde estamos
              </h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-[#16202A]/60">
                <li>{settings.address}</li>
                <li>
                  <a href={telHref} className="transition-colors hover:text-[var(--carmax-accent)]">
                    {settings.phoneNumber}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--carmax-accent)] transition-colors hover:text-[#0A559E]"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-[#16202A]/12 pt-5 text-xs text-[#16202A]/45 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {settings.dealershipName}. Todos los derechos
              reservados.
            </p>
            <Link href="/login" className="transition-colors hover:text-[#16202A]/70">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
