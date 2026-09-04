"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";
import { VehicleFormModal } from "@/components/inventory/vehicle-form-modal";
import { PlusIcon, ArrowRightIcon } from "@/components/icons";

export default function DashboardInventoryPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCars() {
      try {
        const snap = await getDocs(query(collection(db, CARS_COLLECTION), orderBy("createdAt", "desc")));
        if (cancelled) return;
        setCars(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Car));
      } catch (err) {
        if (cancelled) return;
        console.error("[dashboard/inventory] failed to load cars", err);
        setLoadError(
          err instanceof Error ? err.message : "No se pudo cargar el inventario desde Firestore."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCars();
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreateModal() {
    setEditingCar(null);
    setModalOpen(true);
  }

  function openEditModal(car: Car) {
    setEditingCar(car);
    setModalOpen(true);
  }

  // Reflect the write immediately in the grid — no refetch needed. New cars
  // are prepended (they'd sort first by createdAt desc anyway); edited cars
  // are swapped in place by their Firestore id.
  function handleSaved(saved: Car) {
    setCars((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#1D1D1F]">
            Inventario de Vehículos
          </h1>
          <p className="mt-1 text-sm text-[#6E6E73]">
            Stock del showroom, precios y publicaciones activas.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0071E3] px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#0071E3]/90"
        >
          <PlusIcon className="h-4 w-4" />
          Agregar vehículo
        </button>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-[#FF9F0A]/30 bg-[#FF9F0A]/10 p-6 text-sm text-[#8A5300]">
          <p className="font-semibold">No se pudo conectar con Firestore.</p>
          <p className="mt-1">{loadError}</p>
        </div>
      ) : loading ? (
        <div className="flex h-40 items-center justify-center text-sm font-medium text-[#6E6E73]">
          Cargando inventario…
        </div>
      ) : cars.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white/60 p-10 text-center">
          <p className="text-sm font-medium text-[#1D1D1F]">Todavía no hay vehículos cargados.</p>
          <p className="mt-1 text-sm text-[#6E6E73]">
            Usá &quot;Agregar vehículo&quot; para publicar el primero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => {
            const cover = car.images?.[0] || car.img || "";
            return (
              <div
                key={car.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <Link href={`/inventory/${car.id}`} className="relative block h-44 overflow-hidden bg-[#F5F5F7]">
                  {cover && (
                    <Image
                      src={cover}
                      alt={car.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#1D1D1F] backdrop-blur">
                    {car.status === "Published" ? "Publicado" : car.status}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">{car.title}</h3>
                  <div className="mt-1 text-lg font-semibold text-[#0071E3]">{car.price}</div>
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-[#F5F5F7] px-3 py-2 text-xs font-medium text-[#6E6E73]">
                    <span>{car.mileage}</span>
                    <span className="text-right">{car.drivetrain}</span>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditModal(car)}
                      className="flex-1 rounded-xl border border-black/10 py-2.5 text-xs font-semibold text-[#6E6E73] transition-all active:scale-[0.98] hover:border-[#0071E3] hover:text-[#0071E3]"
                    >
                      Editar ficha del vehículo
                    </button>
                    <Link
                      href={`/inventory/${car.id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-2.5 text-xs font-semibold text-[#6E6E73] transition-all active:scale-[0.98] hover:border-[#0071E3] hover:text-[#0071E3]"
                    >
                      Ver
                      <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <VehicleFormModal
        open={modalOpen}
        car={editingCar}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
