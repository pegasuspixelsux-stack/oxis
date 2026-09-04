import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PhoneIcon, MailIcon, PinIcon, InstagramIcon, FacebookIcon, XSocialIcon } from "@/components/icons";
import { ThemeSwitcher } from "@/components/theme-switcher";

const QUICK_LINKS = [
  { href: "#top", label: "Inicio" },
  { href: "#inventory", label: "Inventario" },
  { href: "#tools", label: "Financiación y Canje" },
  { href: "#contact", label: "Contacto" },
];

const HOURS = [
  { day: "Lunes a Viernes", time: "9:00 – 19:00" },
  { day: "Sábado", time: "9:00 – 18:00" },
  { day: "Domingo", time: "Cerrado" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <p className="text-lg font-semibold tracking-tight text-fg">
              OXIS <span className="text-accent">AUTO</span>
            </p>
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
              {HOURS.map((row) => (
                <li key={row.day} className="flex justify-between gap-4">
                  <span>{row.day}</span>
                  <span className="font-mono text-fg">{row.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
              Visitanos
            </h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-fg-muted">
              <li className="flex items-start gap-2.5">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>Av. Italia 3542, Montevideo, Uruguay</span>
              </li>
              <li className="flex items-start gap-2.5">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href="tel:+59826001234" className="hover:text-fg">
                  +598 2600 1234
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
          <p>&copy; {new Date().getFullYear()} OXIS Auto. Todos los derechos reservados.</p>
          <p>
            Imágenes de vehículos vía{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-fg-muted"
            >
              Unsplash
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
