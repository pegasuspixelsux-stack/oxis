"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useSettings } from "@/components/settings-provider";
import { resolveThemeSettings } from "@/lib/db/settings";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { monthlyPayment, estimateListingPayment } from "@/lib/finance";
import { ArrowRightIcon } from "@/components/icons";
import type { HomeProps } from "@/components/themes/types";
import { GvShell } from "./ui/gv-shell";
import { GvButton } from "./ui/gv-button";
import { GvField, gvControlClass } from "./ui/gv-field";

type YTPlayer = {
  mute: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getIframe: () => HTMLIFrameElement;
  destroy: () => void;
};
type YTEvent = { target: YTPlayer; data: number };
type YTPlayerCtor = new (
  el: HTMLElement,
  opts: {
    videoId: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (e: YTEvent) => void;
      onStateChange?: (e: YTEvent) => void;
    };
  }
) => YTPlayer;

declare global {
  interface Window {
    YT?: { Player: YTPlayerCtor };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Copied verbatim from BMW's intro-section copy (hard rule: no imports
// across theme folders). gustavo-villasuso renders these as a precise
// 4-up grid of black spec panels with chrome hairline borders and a
// small red mark, so only the text is kept.
const GUARANTEES = [
  {
    title: "Inspección de 150 puntos",
    description:
      "Cada vehículo es desarmado por técnicos certificados y revisado de punta a punta antes de llegar al showroom.",
  },
  {
    title: "Garantía de devolución de 7 días",
    description:
      "Manejalo una semana. Si no es lo que esperabas, lo devolvés y te reintegramos todo — sin costo de reposición ni letra chica.",
  },
  {
    title: "Precios transparentes, sin regateo",
    description:
      "El precio en el cartel es el precio que pagás. Publicamos nuestro análisis de mercado para que lo verifiques vos mismo.",
  },
  {
    title: "Informe de historial gratuito",
    description:
      "Cada publicación incluye un informe de historial completo sin costo — siniestros, estado de título y service incluidos.",
  },
];

const CONTACT_METHODS = ["WhatsApp", "Teléfono", "Email"] as const;

const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80";

type GvCar = HomeProps["cars"][number];

function listingMonthly(price: string): number | null {
  const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return estimateListingPayment(numeric);
}

export default function HomeHero({ loading, filterCars }: HomeProps) {
  const { settings } = useSettings();
  const theme = resolveThemeSettings(settings, "gustavo-villasuso");
  const collection = filterCars({}).slice(0, 6);

  const { hero } = theme;
  const useVideo = hero.mediaType === "video" && Boolean(hero.videoUrl);

  return (
    <GvShell>
      <Hero
        useVideo={useVideo}
        videoUrl={hero.videoUrl}
        videoStart={hero.videoStart}
        videoEnd={hero.videoEnd}
        videoLoop={hero.videoLoop}
        imageUrl={hero.imageUrl}
        dealershipName={theme.logoText}
      />
      <GuaranteeStrip />
      <CollectionGrid cars={collection} loading={loading} />
      <FinanceBlock />
      <ContactBlock />
    </GvShell>
  );
}

// Accepts a direct video file URL OR a YouTube link and returns how to
// render it. YouTube ids come from youtu.be/ID, watch?v=ID, /embed/ID,
// /shorts/ID.
function parseHeroVideo(url: string): { kind: "youtube"; id: string } | { kind: "file"; url: string } {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (m) return { kind: "youtube", id: m[1] };
  return { kind: "file", url };
}

// Direct video file: seeks to `start` on load and, once `end` is reached
// (end === 0 means the natural end), either restarts from `start` (loop)
// or holds on the last frame.
function GvHeroVideoFile({
  src,
  start,
  end,
  loop,
  poster,
}: {
  src: string;
  start: number;
  end: number;
  loop: boolean;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startTime = start;
    const endTime = end;

    const seekToStart = () => {
      try {
        video.currentTime = startTime;
      } catch {
        /* seeking before metadata — retry on loadedmetadata */
      }
    };
    // Some browsers ignore the `autoPlay` attribute on a src swap; kick
    // playback explicitly once there's enough buffered to start.
    const kick = () => {
      void video.play().catch(() => {});
    };
    // Custom-trimmed seamless loop: once the clip passes `endTime`, jump
    // straight back to `startTime` and keep playing (no pause, no flash).
    const onTimeUpdate = () => {
      if (endTime > 0 && video.currentTime >= endTime) {
        video.currentTime = startTime;
        void video.play();
      }
    };
    const onEnded = () => {
      if (loop) {
        video.currentTime = startTime;
        void video.play();
      }
    };

    video.addEventListener("loadedmetadata", seekToStart);
    video.addEventListener("loadeddata", kick);
    video.addEventListener("canplay", kick);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    if (video.readyState >= 1) seekToStart();
    if (video.readyState >= 2) kick();

    return () => {
      video.removeEventListener("loadedmetadata", seekToStart);
      video.removeEventListener("loadeddata", kick);
      video.removeEventListener("canplay", kick);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [src, start, end, loop]);

  return (
    <video
      ref={videoRef}
      key={src}
      className="absolute inset-0 h-full w-full rounded-none object-cover"
      src={src}
      poster={poster || undefined}
      autoPlay
      muted
      playsInline
      preload="auto"
      loop={loop && end <= 0}
    />
  );
}

// YouTube background via the IFrame Player API. A bare embed with
// `autoplay=1` in the URL frequently stalls on a spinner — Chrome's
// autoplay policy treats the cross-origin frame conservatively — so we
// drive the player object and call mute()+playVideo() in onReady, which
// is what actually starts muted playback. The generated iframe is
// oversized to 16:9 and centred so it covers any viewport with no
// letterboxing; pointer-events are disabled so it reads as a backdrop.
function GvHeroYouTube({
  id,
  start,
  end,
  loop,
}: {
  id: string;
  start: number;
  end: number;
  loop: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: YTPlayer | null = null;
    let cancelled = false;

    const ensureApi = (): Promise<void> => {
      if (window.YT?.Player) return Promise.resolve();
      return new Promise((resolve) => {
        if (!document.getElementById("yt-iframe-api")) {
          const tag = document.createElement("script");
          tag.id = "yt-iframe-api";
          tag.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(tag);
        }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve();
        };
        const poll = window.setInterval(() => {
          if (window.YT?.Player) {
            window.clearInterval(poll);
            resolve();
          }
        }, 120);
      });
    };

    void ensureApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return;
      const mount = document.createElement("div");
      hostRef.current.replaceChildren(mount);
      player = new window.YT.Player(mount, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: loop ? 1 : 0,
          playlist: id,
          origin: window.location.origin,
          ...(start > 0 ? { start: Math.floor(start) } : {}),
          ...(end > 0 ? { end: Math.floor(end) } : {}),
        },
        events: {
          onReady: (e: YTEvent) => {
            const s = e.target.getIframe().style;
            s.position = "absolute";
            s.left = "50%";
            s.top = "50%";
            s.width = "max(100%, 177.78vh)";
            s.height = "max(100%, 56.25vw)";
            s.transform = "translate(-50%, -50%)";
            s.border = "0";
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e: YTEvent) => {
            // 5 === CUED: the video is ready but parked — nudge it into
            // playback (covers the case where the initial playVideo() in
            // onReady lands before the player will accept it).
            if (e.data === 5) {
              e.target.mute();
              e.target.playVideo();
            }
            // 0 === ENDED. With a trimmed `end` the player fires ENDED at
            // the trim point; jump back to `start` and keep playing.
            if (e.data === 0 && loop) {
              e.target.seekTo(start > 0 ? start : 0, true);
              e.target.playVideo();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        player?.destroy();
      } catch {
        /* already gone */
      }
    };
  }, [id, start, end, loop]);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute inset-0 overflow-hidden bg-black"
    />
  );
}

function Hero({
  useVideo,
  videoUrl,
  videoStart,
  videoEnd,
  videoLoop,
  imageUrl,
  dealershipName,
}: {
  useVideo: boolean;
  videoUrl: string;
  videoStart: number;
  videoEnd: number;
  videoLoop: boolean;
  imageUrl: string;
  dealershipName: string;
}) {
  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden border-b border-white/15 bg-black">
      <div className="absolute inset-0 -z-10">
        {useVideo ? (
          (() => {
            const parsed = parseHeroVideo(videoUrl);
            return parsed.kind === "youtube" ? (
              <GvHeroYouTube
                id={parsed.id}
                start={videoStart}
                end={videoEnd}
                loop={videoLoop}
              />
            ) : (
              <GvHeroVideoFile
                src={parsed.url}
                start={videoStart}
                end={videoEnd}
                loop={videoLoop}
                poster={imageUrl}
              />
            );
          })()
        ) : (
          <Image
            src={imageUrl}
            alt={`Showroom de ${dealershipName}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        {/* engineered scrim — heavier left where the copy sits (25% more transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/64 via-black/41 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/53 via-transparent to-transparent" />
      </div>

      <span className="absolute inset-x-0 top-0 h-[3px] bg-[var(--gv-accent)]" />

      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 font-[family-name:var(--font-gv-display)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8CBD0]">
            <span className="inline-block h-4 w-[3px] bg-[var(--gv-accent)]" />
            Colección Vilasuso
          </p>
          <h1 className="mt-6 font-[family-name:var(--font-gv-display)] text-4xl font-light uppercase leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Exclusividad, selección y servicio
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
            El inventario más amplio de alta gama. Respaldado por una atención personal.
          </p>
          <div className="mt-9">
            <GvButton href="#coleccion">
              Ver la colección
              <ArrowRightIcon className="h-4 w-4" />
            </GvButton>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-px border border-white/15 bg-white/15 font-[family-name:var(--font-gv-display)]">
            {[
              { k: "Marcas", v: "BMW · MINI · Mazda" },
              { k: "Verificación", v: "150 puntos" },
              { k: "Procedencia", v: "Documentada" },
            ].map((s) => (
              <div key={s.k} className="bg-black px-4 py-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  {s.k}
                </dt>
                <dd className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <span className="absolute bottom-0 left-0 bg-[var(--gv-accent)] px-3 py-1.5 font-[family-name:var(--font-gv-display)] text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
        Cada unidad, verificada
      </span>
    </section>
  );
}

function GuaranteeStrip() {
  return (
    <section className="border-b border-white/15 bg-[#0B0B0C]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-gv-display)] text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
          Lo que verificamos en cada unidad
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((item) => (
            <div key={item.title} className="bg-black p-6">
              <span className="inline-block h-2 w-8 bg-[var(--gv-accent)]" />
              <h3 className="mt-4 font-[family-name:var(--font-gv-display)] text-sm font-semibold uppercase tracking-wide text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
              <p className="mt-4 font-[family-name:var(--font-gv-display)] text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C8CBD0]">
                Verificado
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DatasheetCard({ car }: { car: GvCar }) {
  const image = car.images?.[0] || car.img || FALLBACK_CAR_IMAGE;
  const monthly = listingMonthly(car.price);

  return (
    <article className="flex flex-col border border-white/15 bg-[#0B0B0C] transition-colors hover:border-white/40">
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL */}
        <img src={image} alt={car.title} className="h-full w-full object-cover" />
        <span className="absolute left-0 top-0 bg-black/80 px-2.5 py-1 font-[family-name:var(--font-gv-display)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8CBD0]">
          {car.make}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-[family-name:var(--font-gv-display)] text-sm font-semibold uppercase leading-snug tracking-wide text-white">
          {car.title}
        </h3>
        <p className="mt-3 border-t border-white/10 pt-3 text-xs uppercase tracking-wide text-white/55">
          {car.year} · {car.mileage || "—"} · {car.drivetrain || "—"}
        </p>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="block font-[family-name:var(--font-gv-display)] text-lg font-bold text-white">
              {car.price}
            </span>
            {monthly && (
              <span className="text-xs text-[var(--gv-accent)]">
                ${Math.round(monthly).toLocaleString("en-US")}/mes
              </span>
            )}
          </div>
          <GvButton
            href={`/inventory/${car.id}`}
            variant="outline"
            className="!px-3.5 !py-2 !text-[11px]"
          >
            Ver ficha
          </GvButton>
        </div>
      </div>
    </article>
  );
}

function CollectionGrid({ cars, loading }: { cars: GvCar[]; loading: boolean }) {
  return (
    <section id="coleccion" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <h2 className="font-[family-name:var(--font-gv-display)] text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
            Colección Vilasuso
          </h2>
          <p className="mt-2 text-sm text-white/55">
            Selección alemana y japonesa — disponibilidad inmediata, procedencia documentada.
          </p>
        </div>
        <GvButton href="/inventory" variant="outline">
          Ver inventario completo
        </GvButton>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-white/15 bg-[#0B0B0C]" aria-hidden>
                <div className="aspect-[16/10] animate-pulse bg-white/5" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse bg-white/5" />
                  <div className="h-3 w-full animate-pulse bg-white/5" />
                  <div className="h-6 w-24 animate-pulse bg-white/5" />
                </div>
              </div>
            ))
          : cars.map((car) => <DatasheetCard key={car.id} car={car} />)}
      </div>

      {!loading && cars.length === 0 && (
        <p className="mt-10 border border-white/15 bg-[#0B0B0C] p-6 text-sm text-white/55">
          Todavía no hay unidades publicadas en la colección.
        </p>
      )}
    </section>
  );
}

function FinanceBlock() {
  const [price, setPrice] = useState(48000);
  const [downPayment, setDownPayment] = useState(15000);
  const [apr, setApr] = useState(6.9);
  const [term, setTerm] = useState(60);

  const principal = Math.max(0, price - downPayment);
  const monthly = monthlyPayment(principal, apr, term);
  const totalCost = monthly * term + downPayment;

  return (
    <section id="financiacion" className="border-y border-white/15 bg-[#0B0B0C]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-gv-display)] text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
            Calculadora de financiación
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Estimá tu cuota mensual antes de venir. Los valores son orientativos y quedan
            sujetos a aprobación crediticia.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px border border-white/15 bg-white/15 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-6 bg-black p-6 sm:p-8">
            <SliderRow
              label="Precio del vehículo"
              value={`$${price.toLocaleString("en-US")}`}
              min={10000}
              max={200000}
              step={1000}
              current={price}
              onChange={setPrice}
            />
            <SliderRow
              label="Entrega inicial"
              value={`$${Math.min(downPayment, price).toLocaleString("en-US")}`}
              min={0}
              max={Math.max(1000, price)}
              step={1000}
              current={Math.min(downPayment, price)}
              onChange={setDownPayment}
            />
            <SliderRow
              label="Tasa anual (TNA)"
              value={`${apr.toFixed(1)}%`}
              min={0}
              max={20}
              step={0.1}
              current={apr}
              onChange={setApr}
            />
            <SliderRow
              label="Plazo"
              value={`${term} meses`}
              min={12}
              max={84}
              step={12}
              current={term}
              onChange={setTerm}
            />
          </div>

          <div className="flex flex-col justify-center gap-1 bg-black p-6 sm:p-8">
            <span className="font-[family-name:var(--font-gv-display)] text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C8CBD0]">
              Cuota mensual estimada
            </span>
            <span className="font-[family-name:var(--font-gv-display)] text-4xl font-extrabold text-[var(--gv-accent)]">
              ${Math.round(monthly).toLocaleString("en-US")}
            </span>
            <dl className="mt-5 flex flex-col gap-2 border-t border-white/15 pt-4 text-xs text-white/60">
              <div className="flex justify-between">
                <dt>Monto a financiar</dt>
                <dd className="text-white">${principal.toLocaleString("en-US")}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Plazo</dt>
                <dd className="text-white">
                  {term} meses · TNA {apr.toFixed(1)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Costo total estimado</dt>
                <dd className="text-white">${Math.round(totalCost).toLocaleString("en-US")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C8CBD0]">
          {label}
        </span>
        <span className="font-[family-name:var(--font-gv-display)] text-sm font-semibold text-white">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--gv-accent)]"
      />
    </div>
  );
}

function ContactBlock() {
  const { settings } = useSettings();
  const theme = resolveThemeSettings(settings, "gustavo-villasuso");
  const leadForm = useLeadForm();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [preferredContact, setPreferredContact] =
    useState<(typeof CONTACT_METHODS)[number]>("WhatsApp");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await leadForm.submit({ name, email, phone, preferredContact, message });
    } catch {
      /* leadForm.error is set by the hook */
    }
  }

  return (
    <section id="contacto" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="font-[family-name:var(--font-gv-display)] text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
        Escribinos
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-white/55">
        Dejanos tus datos y un asesor de {theme.logoText} te contacta dentro de un día
        hábil.
      </p>

      {leadForm.success ? (
        <div className="mt-10 border border-white/15 bg-[#0B0B0C] p-6">
          <span className="inline-block h-2 w-8 bg-[var(--gv-accent)]" />
          <h3 className="mt-3 font-[family-name:var(--font-gv-display)] text-base font-semibold uppercase tracking-wide text-white">
            Consulta enviada
          </h3>
          <p className="mt-2 text-sm text-white/55">
            Ya la recibimos. Un asesor se comunica a la brevedad.
          </p>
          <button
            type="button"
            onClick={() => leadForm.reset()}
            className="mt-4 rounded-none border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-white"
          >
            Enviar otra
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <GvField label="Nombre completo">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={gvControlClass}
              />
            </GvField>
            <GvField label="Teléfono">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={gvControlClass}
              />
            </GvField>
          </div>

          <GvField label="Correo electrónico">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={gvControlClass}
            />
          </GvField>

          <div>
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#C8CBD0]">
              Contacto preferido
            </span>
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredContact(method)}
                  className={`rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    preferredContact === method
                      ? "bg-[var(--gv-accent)] text-white"
                      : "border border-white/25 text-white/70 hover:border-white"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <GvField label="Mensaje">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={gvControlClass}
              placeholder="Contanos qué unidad de la colección estás buscando…"
            />
          </GvField>

          {leadForm.error && (
            <p className="text-sm font-medium text-[var(--gv-accent)]">{leadForm.error}</p>
          )}

          <GvButton type="submit" disabled={leadForm.submitting}>
            {leadForm.submitting ? "Enviando…" : "Enviar consulta"}
          </GvButton>
        </form>
      )}
    </section>
  );
}
