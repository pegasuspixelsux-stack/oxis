"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";
import { Container } from "@/components/themes/bmw/ui/container";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/themes/bmw/ui/button";
import { PillGroup } from "@/components/themes/bmw/ui/pill-group";
import { FilterSelect } from "@/components/themes/bmw/inventory/filter-select";
import { useShowroom } from "@/components/showroom-context";
import { useSettings } from "@/components/settings-provider";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { PhoneIcon, MailIcon, PinIcon, ClockIcon, CheckCircleIcon, WhatsAppIcon } from "@/components/icons";

const CONTACT_METHODS = ["Email", "Phone", "Text"] as const;
const CONTACT_METHOD_LABELS: Record<(typeof CONTACT_METHODS)[number], string> = {
  Email: "Email",
  Phone: "Teléfono",
  Text: "Mensaje",
};
const TIME_SLOTS = [
  { value: "morning", label: "Mañana (9 a 12)" },
  { value: "afternoon", label: "Tarde (12 a 16)" },
  { value: "evening", label: "Noche (16 a 19)" },
];

const inputClasses =
  "h-12 w-full rounded-none border border-border-strong bg-bg-elevated px-4 text-sm text-fg outline-none transition-colors focus:border-accent";

type Errors = Partial<Record<"name" | "email" | "phone", string>>;

export function ContactSection() {
  const { selectedVehicleId } = useShowroom();
  const { settings } = useSettings();
  const telHref = `tel:${settings.phoneNumber.replace(/[^0-9+]/g, "")}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola ${settings.dealershipName}, quiero hacer una consulta.`
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<(typeof CONTACT_METHODS)[number]>("Email");
  const [vehicleId, setVehicleId] = useState("none");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0].value);
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Fetched once from Firestore so the picker (and the vehicleId a lead
  // ends up tagged with) refers to a real inventory document — it used to
  // read the static lib/vehicles.ts demo data, which no dashboard page
  // reads anymore, so a lead's vehicle of interest showed up as a raw,
  // unresolvable id instead of a name.
  const [cars, setCars] = useState<Car[]>([]);
  useEffect(() => {
    let cancelled = false;
    getDocs(query(collection(db, CARS_COLLECTION), orderBy("createdAt", "desc")))
      .then((snap) => {
        if (!cancelled) setCars(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Car));
      })
      .catch((err) => console.error("[contact-section] failed to load cars", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const vehicleOptions = useMemo(
    () => [
      { value: "none", label: "Aún no estoy seguro" },
      ...cars.map((c) => ({ value: c.id, label: c.title })),
    ],
    [cars]
  );

  const effectiveVehicleId = vehicleId !== "none" ? vehicleId : selectedVehicleId ?? "none";

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Por favor, ingresá tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Ingresá un correo electrónico válido.";
    if (phone.replace(/\D/g, "").length < 7) next.phone = "Ingresá un número de teléfono válido.";
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          preferredContact,
          vehicleId: effectiveVehicleId,
          preferredDate,
          preferredTime,
          message,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setPreferredContact("Email");
    setVehicleId("none");
    setPreferredDate("");
    setPreferredTime(TIME_SLOTS[0].value);
    setMessage("");
    setErrors({});
    setStatus("idle");
  }

  return (
    <section id="contact" className="relative border-t border-border py-20 sm:py-28">
      <Container>
        <Reveal>
          <p className="font-mono text-sm uppercase sm:text-xs tracking-[0.2em] text-accent">Contacto</p>
          <h2 className="mt-3 max-w-lg text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Hacé una consulta o reservá una prueba de manejo.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal delay={0.05}>
            <div className="rounded-none border border-border bg-bg-elevated p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-start gap-4 py-8"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <CheckCircleIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-fg">¡Gracias, ya lo recibimos!</h3>
                      <p className="mt-1 text-sm text-fg-muted">
                        Un integrante de nuestro equipo se va a comunicar dentro de un día hábil
                        para confirmar los detalles.
                      </p>
                    </div>
                    <Button variant="secondary" onClick={resetForm}>
                      Enviar otro mensaje
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    noValidate
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
                          Nombre completo
                        </span>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={inputClasses}
                          aria-invalid={Boolean(errors.name)}
                        />
                        {errors.name && <p className="mt-1.5 text-xs text-danger">{errors.name}</p>}
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
                          Correo electrónico
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClasses}
                          aria-invalid={Boolean(errors.email)}
                        />
                        {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email}</p>}
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
                          Teléfono
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputClasses}
                          aria-invalid={Boolean(errors.phone)}
                        />
                        {errors.phone && <p className="mt-1.5 text-xs text-danger">{errors.phone}</p>}
                      </label>

                      <div>
                        <span className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
                          Método de contacto preferido
                        </span>
                        <PillGroup
                          options={CONTACT_METHODS as unknown as string[]}
                          value={preferredContact}
                          onChange={(v) => setPreferredContact(v as (typeof CONTACT_METHODS)[number])}
                          format={(v) => CONTACT_METHOD_LABELS[v as (typeof CONTACT_METHODS)[number]]}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FilterSelect
                          label="Vehículo de interés"
                          value={effectiveVehicleId}
                          onValueChange={setVehicleId}
                          options={vehicleOptions}
                        />
                      </div>

                      <label className="block">
                        <span className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
                          Fecha preferida para la prueba de manejo
                        </span>
                        <input
                          type="date"
                          value={preferredDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className={inputClasses}
                        />
                      </label>

                      <div>
                        <span className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
                          Horario preferido
                        </span>
                        <PillGroup
                          options={TIME_SLOTS.map((t) => t.value)}
                          value={preferredTime}
                          onChange={setPreferredTime}
                          format={(v) => TIME_SLOTS.find((t) => t.value === v)?.label ?? v}
                        />
                      </div>

                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
                          Mensaje
                        </span>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          className="w-full rounded-none border border-border-strong bg-bg-elevated px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent"
                          placeholder="Contanos qué estás buscando…"
                        />
                      </label>
                    </div>

                    {status === "error" && (
                      <p className="mt-4 text-sm text-danger">
                        Hubo un problema al enviar tu mensaje. Intentá de nuevo.
                      </p>
                    )}

                    <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={status === "submitting"}>
                      {status === "submitting" ? "Enviando…" : "Enviar consulta"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col overflow-hidden rounded-none border border-border bg-bg-elevated">
              <div className="relative h-64 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1518987048-93e29699e79a"
                  alt="Showroom de OXIS Auto de noche"
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
              <div>
                <h3 className="text-lg font-medium text-fg">Visitá el showroom</h3>
                <p className="mt-1 text-sm text-fg-muted">
                  Pasá por el local, o escribinos y te respondemos rápido.
                </p>
              </div>

              <ul className="flex flex-col gap-4 text-sm text-fg-muted">
                <li className="flex items-start gap-3">
                  <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{settings.address}</span>
                </li>
                <li className="flex items-start gap-3">
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{settings.phoneNumber}</span>
                </li>
                <li className="flex items-start gap-3">
                  <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>hola@oxisauto.example</span>
                </li>
                <li className="flex items-start gap-3">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="whitespace-pre-line">{settings.businessHours}</span>
                </li>
              </ul>

              <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  href={whatsappHref}
                  external
                  variant="secondary"
                  className="flex-1 justify-center"
                  icon={<WhatsAppIcon className="h-4 w-4" />}
                >
                  WhatsApp
                </Button>
                <Button href={telHref} variant="secondary" className="flex-1 justify-center">
                  Llamar Ahora
                </Button>
                <Button href={mapsHref} external variant="secondary" className="flex-1 justify-center">
                  Cómo Llegar
                </Button>
              </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
