"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { voituretFontClass } from "../fonts";

const NAV_LINKS = [
  { href: "#inventory", label: "Colección" },
  { href: "#curaduria", label: "Curaduría" },
  { href: "#contacto", label: "Contacto" },
];

// voituret page shell: an ivory canvas with an airy, minimal top bar and
// an understated footer set in small wide-tracked caps. The metallic
// accent CSS variable is set once here so every descendant primitive
// (VoituretButton hover, VoituretField focus underline, hairline
// flourishes) can read `var(--voituret-accent)`.
export function VoituretShell({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${settings.dealershipName}, quisiera consultar por una pieza de la colección.`
  );
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <div
      id="top"
      className={`${voituretFontClass} flex min-h-screen flex-col bg-[#F6F3EE] font-[family-name:var(--font-voituret-sans)] text-[#1A1A1A]`}
      style={{ "--voituret-accent": "#8A6D3B" } as CSSProperties}
    >
      <header className="border-b border-[#1A1A1A]/12">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-10">
          <Link
            href="#top"
            className="font-[family-name:var(--font-voituret-serif)] text-2xl font-light tracking-[0.02em]"
          >
            {settings.dealershipName}
          </Link>

          <nav className="hidden items-center gap-12 text-[11px] font-medium uppercase tracking-[0.24em] text-[#1A1A1A]/60 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[var(--voituret-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="transition-colors hover:text-[var(--voituret-accent)]"
            >
              Panel
            </Link>
          </nav>

          <a
            href={telHref}
            className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#1A1A1A]/60 transition-colors hover:text-[var(--voituret-accent)] md:hidden"
          >
            Llamar
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#1A1A1A]/12">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-[family-name:var(--font-voituret-serif)] text-xl font-light">
                {settings.dealershipName}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#1A1A1A]/55">
                Una selección reducida de automóviles escogidos uno por uno. Curaduría,
                procedencia y discreción.
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/40">
                Dirección
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#1A1A1A]/55">{settings.address}</p>
            </div>

            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/40">
                Horario
              </h3>
              <ul className="mt-4 flex flex-col gap-1.5 text-sm text-[#1A1A1A]/55">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#1A1A1A]/40">
                Contacto
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-[#1A1A1A]/55">
                <li>
                  <a href={telHref} className="transition-colors hover:text-[var(--voituret-accent)]">
                    {settings.phoneNumber}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uppercase tracking-[0.24em] text-[11px] font-medium text-[#1A1A1A]/70 transition-colors hover:text-[var(--voituret-accent)]"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-2 border-t border-[#1A1A1A]/12 pt-6 text-[10px] uppercase tracking-[0.24em] text-[#1A1A1A]/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {settings.dealershipName}
            </p>
            <Link href="/login" className="transition-colors hover:text-[#1A1A1A]/70">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
