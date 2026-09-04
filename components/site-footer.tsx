"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PhoneIcon, MailIcon, PinIcon, InstagramIcon, FacebookIcon, XSocialIcon } from "@/components/icons";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useSettings } from "@/components/settings-provider";

const QUICK_LINKS = [
  { href: "#top", label: "Inicio" },
  { href: "#inventory", label: "Inventario" },
  { href: "#tools", label: "Financiación y Canje" },
  { href: "#contact", label: "Contacto" },
];

export function SiteFooter() {
  const { settings } = useSettings();
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const hoursLines = settings.businessHours.split("\n").filter(Boolean);

  return (
    <footer className="border-t border-border bg-bg-elevated">
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <p className="text-lg font-semibold uppercase tracking-tight text-fg">{settings.dealershipName}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-muted">
              Una concesionaria de usados certificados basada en precios transparentes,
              inspecciones rigurosas y garantías que podés exigirnos.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="OXIS Auto en Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="OXIS Auto en Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="OXIS Auto en X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                <XSocialIcon className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-6">
              <ThemeSwitcher />
            </div>
          </div>

          <div>
            <h3 className="font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
              Enlaces Rápidos
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-fg-muted transition-colors hover:text-fg">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
              Horario de Atención
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-fg-muted">
              {hoursLines.map((line, i) => {
                const colonIndex = line.indexOf(":");
                const day = colonIndex === -1 ? line.trim() : line.slice(0, colonIndex).trim();
                const time = colonIndex === -1 ? "" : line.slice(colonIndex + 1).trim();
                return (
                  <li key={i} className="flex justify-between gap-4">
                    <span>{day}</span>
                    {time && <span className="font-mono text-fg">{time}</span>}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
              Visitanos
            </h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-fg-muted">
              <li className="flex items-start gap-2.5">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={telHref} className="hover:text-fg">
                  {settings.phoneNumber}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href="mailto:hola@oxisauto.example" className="hover:text-fg">
                  hola@oxisauto.example
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {settings.dealershipName}. Todos los derechos
            reservados.
          </p>
          <p className="flex items-center gap-1">
            <span>
              Imágenes de vehículos vía{" "}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-fg-muted"
              >
                Unsplash
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <Link href="/login" className="underline underline-offset-2 hover:text-fg-muted">
              Acceso interno
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
