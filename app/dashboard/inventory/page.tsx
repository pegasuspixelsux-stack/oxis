import Image from "next/image";
import { vehicles, formatPrice, formatMileage } from "@/lib/vehicles";

export default function InventoryPage() {
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
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={vehicle.image}
                alt={vehicle.imageAlt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#1D1D1F] backdrop-blur">
                Publicado
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-sm font-semibold text-[#1D1D1F]">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <div className="mt-1 text-lg font-semibold text-[#0071E3]">
                {formatPrice(vehicle.price)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-[#F5F5F7] px-3 py-2 text-xs font-medium text-[#6E6E73]">
                <span>{formatMileage(vehicle.mileage)}</span>
                <span className="text-right">{vehicle.drivetrain}</span>
              </div>
              <button
                type="button"
                className="mt-auto w-full rounded-xl border border-black/10 py-2.5 text-xs font-semibold text-[#6E6E73] transition-all active:scale-[0.98] hover:border-[#0071E3] hover:text-[#0071E3]"
              >
                Editar ficha del vehículo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
