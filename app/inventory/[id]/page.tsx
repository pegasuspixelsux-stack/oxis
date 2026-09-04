"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80";

export default function CarDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  // images[0] is the fixed cover/hero shot everywhere else in the app; this
  // index only changes which photo the *viewer* is currently looking at in
  // this page's slideshow — it never reorders the underlying array.
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchCar() {
      try {
        const snap = await getDoc(doc(db, CARS_COLLECTION, id));
        if (cancelled) return;
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          setCar({ id: snap.id, ...snap.data() } as Car);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[inventory/[id]] failed to load car", err);
        setError(err instanceof Error ? err.message : "No se pudo cargar el vehículo.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCar();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = car?.images && car.images.length ? car.images : car?.img ? [car.img] : [];
  const heroImage = images[activeIndex] ?? images[0] ?? FALLBACK_IMAGE;

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      <header className="sticky top-0 z-40 border-b border-[#D2D2D7]/40 bg-[#FBFBFD]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-bold tracking-tight">
            OXIS<span className="text-blue-600">.</span>{" "}
            <span className="font-normal text-slate-400">Showroom</span>
          </Link>
          <Link href="/inventory" className="text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900">
            &larr; Volver al inventario
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 pb-24">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm font-medium text-slate-500">
            Cargando vehículo…
          </div>
        ) : notFound ? (
          <div className="rounded-2xl border border-[#D2D2D7]/60 bg-white p-12 text-center">
            <h1 className="text-lg font-bold text-slate-800">No encontramos este vehículo</h1>
            <p className="mt-2 text-sm text-slate-500">
              Puede que ya no esté publicado. Volvé al inventario para ver el stock actual.
            </p>
            <Link
              href="/inventory"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Ver inventario
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-6 text-sm text-amber-800">
            {error}
          </div>
        ) : car ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[#D2D2D7]/60 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/Unsplash URL, not an app asset */}
                <img src={heroImage} alt={car.title} className="h-full w-full object-cover" />
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {images.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                        i === activeIndex ? "border-blue-600" : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of an arbitrary URL */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
                {car.make}
              </span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1D1D1F]">{car.title}</h1>
              <div className="mt-3 text-3xl font-bold text-[#1D1D1F]">{car.price}</div>

              <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-[#D2D2D7]/60 bg-white p-4 text-sm">
                <Spec label="Año" value={String(car.year)} />
                <Spec label="Kilometraje" value={car.mileage} />
                <Spec label="Tracción" value={car.drivetrain} />
                <Spec label="Transmisión" value={car.transmission} />
                <Spec label="Carrocería" value={car.bodyStyle} />
                <Spec label="Estado" value={car.status} />
              </div>

              <Link
                href="/#contact"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700"
              >
                Consultar por este vehículo
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-0.5 font-medium text-slate-800">{value}</div>
    </div>
  );
}
