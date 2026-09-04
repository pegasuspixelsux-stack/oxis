import Image from "next/image";
import Link from "next/link";
import { vehicles, formatPrice } from "@/lib/vehicles";
import { listLeads, LEAD_STAGE_LABELS, type Lead } from "@/lib/db/leads";

// The leads panel below reads live Firestore data on every request.
export const dynamic = "force-dynamic";

function vehicleLabel(vehicleId: string | null): string {
  if (!vehicleId) return "Aún no está seguro";
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : vehicleId;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.round(hours / 24)}d`;
}

export default async function DashboardOverview() {
  const recentVehicles = vehicles.slice(0, 3);

  let leads: Lead[] = [];
  let leadsError: string | null = null;
  try {
    leads = await listLeads();
  } catch (error) {
    leadsError = error instanceof Error ? error.message : "Error desconocido.";
  }
  const recentLeads = leads.slice(0, 3);

  const STATS = [
    { label: "Inventario Activo", value: `${vehicles.length} autos`, change: "+2 esta semana" },
    { label: "Consultas Totales", value: leadsError ? "—" : String(leads.length), change: "" },
    { label: "Tasa de Conversión", value: "4,8%", change: "+0,4%" },
    { label: "Calificación Google", value: "4.9 / 5", change: "480+ reseñas" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#1D1D1F]">Panel de Control</h1>
        <p className="mt-1 text-sm text-[#6E6E73]">
          Resumen de las métricas del concesionario, el estado del inventario y las consultas
          entrantes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#6E6E73]">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-[#1D1D1F]">
                {stat.value}
              </p>
            </div>
            <p className="mt-4 text-xs font-medium text-emerald-600">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1D1D1F]">Últimos Vehículos Publicados</h3>
            <Link href="/dashboard/inventory" className="text-xs font-medium text-[#0071E3] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {recentVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center gap-4 rounded-xl border border-black/[0.06] bg-[#F5F5F7]/60 p-3"
              >
                <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image src={vehicle.image} alt={vehicle.imageAlt} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#1D1D1F]">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-xs font-medium text-[#0071E3]">{formatPrice(vehicle.price)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Publicado
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1D1D1F]">Últimas Consultas</h3>
            <Link href="/dashboard/leads" className="text-xs font-medium text-[#0071E3] hover:underline">
              Ver todas
            </Link>
          </div>
          {leadsError ? (
            <p className="text-xs text-[#8A5300]">No se pudo conectar con Firestore: {leadsError}</p>
          ) : recentLeads.length === 0 ? (
            <p className="text-xs text-[#6E6E73]">Todavía no hay consultas.</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-[#F5F5F7]/60 p-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#1D1D1F]">{lead.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#6E6E73]">{vehicleLabel(lead.vehicleId)}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[10px] font-semibold text-[#0071E3]">
                      {LEAD_STAGE_LABELS[lead.stage]}
                    </span>
                    <p className="mt-1 text-[10px] text-[#6E6E73]">{relativeTime(lead.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
