"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { renatoContiFontClass } from "../fonts";

const NAV_LINKS = [
  { href: "#coleccion", label: "Colección" },
  { href: "#contacto", label: "Contacto" },
];

// renato-conti page shell: an absolute-black canvas with a near-invisible
// top bar and a whisper of a footer, both set in tiny wide-tracked caps.
// The platinum accent CSS variable is set once here so every descendant
// primitive (RcButton hover, hairline flourishes) can read
// `var(--rc-accent)`.
export function RcShell({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { logoText, address } = resolveThemeSettings(settings, "renato-conti");
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${logoText}, quisiera consultar por una pieza de la curaduría.`
  );
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <div
      id="top"
      className={`${renatoContiFontClass} flex min-h-screen flex-col bg-black font-[family-name:var(--font-rc-body)] text-[#E8E8E8]`}
      style={{ "--rc-accent": "#C7C9CC" } as CSSProperties}
    >
      <header className="border-b border-[#FFFFFF14]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-12">
          <Link
            href="#top"
            className="font-[family-name:var(--font-rc-display)] text-[13px] font-light uppercase tracking-[0.34em] text-[#E8E8E8]"
          >
            {logoText}
          </Link>

          <nav className="flex items-center gap-10 font-[family-name:var(--font-rc-display)] text-[10px] uppercase tracking-[0.28em] text-[#8C8C8C]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#E8E8E8]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/inventory"
              className="hidden transition-colors hover:text-[#E8E8E8] sm:inline"
            >
              Piezas
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#FFFFFF14]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-12">
          <p className="font-[family-name:var(--font-rc-display)] text-[11px] uppercase tracking-[0.34em] text-[#E8E8E8]">
            {logoText} — Black Edition
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 text-[11px] uppercase tracking-[0.22em] text-[#8C8C8C] sm:grid-cols-3">
            <div>
              <p className="text-[#E8E8E8]">Dirección</p>
              <p className="mt-4 leading-relaxed normal-case tracking-normal text-[#8C8C8C]">
                {address}
              </p>
            </div>

            <div>
              <p className="text-[#E8E8E8]">Horario</p>
              <ul className="mt-4 flex flex-col gap-1.5 normal-case tracking-normal text-[#8C8C8C]">
                {hoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[#E8E8E8]">Contacto</p>
              <ul className="mt-4 flex flex-col gap-2">
                <li>
                  <a
                    href={telHref}
                    className="normal-case tracking-normal text-[#8C8C8C] transition-colors hover:text-[#E8E8E8]"
                  >
                    {settings.phoneNumber}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#E8E8E8]"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-2 border-t border-[#FFFFFF14] pt-6 text-[10px] uppercase tracking-[0.24em] text-[#5A5A5A] sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {logoText}
            </p>
            <Link href="/login" className="transition-colors hover:text-[#8C8C8C]">
              Acceso interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
