import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { ShieldIcon, ChecklistIcon, TagIcon, DocumentIcon } from "@/components/icons";

const GUARANTEES = [
  {
    icon: ShieldIcon,
    title: "Inspección de 150 puntos",
    description:
      "Cada vehículo es desarmado por técnicos certificados y revisado de punta a punta antes de llegar al showroom.",
  },
  {
    icon: ChecklistIcon,
    title: "Garantía de devolución de 7 días",
    description:
      "Manejalo una semana. Si no es lo que esperabas, lo devolvés y te reintegramos todo — sin costo de reposición ni letra chica.",
  },
  {
    icon: TagIcon,
    title: "Precios transparentes, sin regateo",
    description:
      "El precio en el cartel es el precio que pagás. Publicamos nuestro análisis de mercado para que lo verifiques vos mismo.",
  },
  {
    icon: DocumentIcon,
    title: "Informe de historial gratuito",
    description:
      "Cada publicación incluye un informe de historial completo sin costo — siniestros, estado de título y service incluidos.",
  },
];

const STATS = [
  { value: "18", label: "Años en el mercado" },
  { value: "6.200+", label: "Autos entregados" },
  { value: "4.9 / 5", label: "Calificación promedio" },
];

export function IntroSection() {
  return (
    <section id="about" className="relative border-t border-border py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-14">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div>
                <p className="font-mono text-sm uppercase sm:text-xs tracking-[0.2em] text-accent">
                  Sobre OXIS Auto
                </p>
                <h2 className="mt-3 max-w-md text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                  Una concesionaria construida sobre confianza, no presión.
                </h2>

                <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <dt className="font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
                        {stat.label}
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold text-fg">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-base leading-relaxed text-fg-muted">
                  Creamos OXIS para arreglar lo que está mal en la compra de un auto usado:
                  precios poco claros, pruebas de manejo apuradas e inspecciones que hay que
                  tomar a fe. Cada vehículo que vendemos se recondiciona en nuestro taller y
                  queda respaldado por escrito.
                </p>
                <p className="text-base leading-relaxed text-fg-muted">
                  Somos un equipo uruguayo que conoce el mercado local y elige cada vehículo
                  pensando en vos.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {GUARANTEES.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="flex gap-4 rounded-2xl border border-border bg-bg-elevated p-5 transition-colors hover:border-border-strong sm:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-fg">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
