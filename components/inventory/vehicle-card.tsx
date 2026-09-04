import Image from "next/image";
import { motion } from "motion/react";
import type { Vehicle } from "@/lib/vehicles";
import { formatPrice, fuelTypeLabels, transmissionLabels } from "@/lib/vehicles";
import { estimateListingPayment } from "@/lib/finance";
import { FuelIcon, TransmissionIcon, DrivetrainIcon, ArrowRightIcon } from "@/components/icons";

export function VehicleCard({
  vehicle,
  onInquire,
}: {
  vehicle: Vehicle;
  onInquire: (id: string) => void;
}) {
  const specs = [
    { icon: FuelIcon, value: fuelTypeLabels[vehicle.fuelType] },
    { icon: TransmissionIcon, value: transmissionLabels[vehicle.transmission] },
    { icon: DrivetrainIcon, value: vehicle.drivetrain },
  ];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-colors hover:border-border-strong"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={vehicle.image}
          alt={vehicle.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {vehicle.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-3 py-1 font-mono text-sm uppercase sm:text-xs tracking-wider text-accent backdrop-blur">
            {vehicle.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-medium text-fg">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="mt-0.5 text-sm text-fg-muted">
          {vehicle.trim} &middot; {vehicle.exteriorColor}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-2">
          {specs.map((spec) => (
            <div key={spec.value} className="flex items-center gap-1.5 text-xs text-fg-muted">
              <spec.icon className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
              <span className="truncate font-mono">{spec.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="font-mono text-xl font-semibold text-fg">
              {formatPrice(Math.round(estimateListingPayment(vehicle.price)))}
              <span className="text-sm font-normal text-fg-muted">/mes*</span>
            </span>
            <p className="mt-0.5 text-xs text-fg-subtle">
              o {formatPrice(vehicle.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onInquire(vehicle.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
          >
            Consultar
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
