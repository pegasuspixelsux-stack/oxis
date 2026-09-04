import Image from "next/image";
import Link from "next/link";
import { vehicles, formatPrice } from "@/lib/vehicles";

const STATS = [
  { label: "Inventario Activo", value: `${vehicles.length} autos`, change: "+2 esta semana" },
  { label: "Consultas Totales", value: "1.280", change: "+12,5%" },
  { label: "Tasa de Conversión", value: "4,8%", change: "+0,4%" },
  { label: "Calificación Google", value: "4.9 / 5", change: "480+ reseñas" },
];

const RECENT_LEADS = [
  { name: "Micaela Vance", vehicle: "2019 BMW M4", status: "Consulta nueva", time: "hace 12m" },
  { name: "Sara Jenkins", vehicle: "2018 Porsche Panamera", status: "Prueba agendada", time: "hace 1h" },
  { name: "Carlos Méndez", vehicle: "Tasación de canje", status: "Revisión de documentos", time: "hace 3h" },
];

export default function DashboardOverview() {
  const recentVehicles = vehicles.slice(0, 3);

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
          <div className="space-y-3">
            {RECENT_LEADS.map((lead) => (
              <div
                key={lead.name}
                className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-[#F5F5F7]/60 p-3"
              >
                <div>
                  <p className="text-xs font-semibold text-[#1D1D1F]">{lead.name}</p>
                  <p className="mt-0.5 text-[11px] text-[#6E6E73]">{lead.vehicle}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[10px] font-semibold text-[#0071E3]">
                    {lead.status}
                  </span>
                  <p className="mt-1 text-[10px] text-[#6E6E73]">{lead.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#6E6E73]">
        * Las consultas mostradas son datos de ejemplo hasta conectar el formulario de contacto a
        una base de datos.
      </p>
    </div>
  );
}
