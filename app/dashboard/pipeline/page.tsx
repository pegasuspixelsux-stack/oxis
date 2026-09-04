import { listLeads, LEAD_STAGE_LABELS, type Lead, type LeadStage } from "@/lib/db/leads";
import { vehicles } from "@/lib/vehicles";

// This reads live Firestore data on every request — never prerender/cache it.
export const dynamic = "force-dynamic";

const STAGE_ORDER: LeadStage[] = ["new", "contacted", "test-drive", "financing"];

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
  const days = Math.round(hours / 24);
  return `hace ${days}d`;
}

export default async function PipelinePage() {
  let leads: Lead[] = [];
  let configError: string | null = null;

  try {
    leads = await listLeads();
  } catch (error) {
    configError = error instanceof Error ? error.message : "Error desconocido.";
  }

  const columns = STAGE_ORDER.map((stage) => ({
    stage,
    title: LEAD_STAGE_LABELS[stage],
    items: leads.filter((lead) => lead.stage === stage),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#1D1D1F]">
          Pipeline de Consultas
        </h1>
        <p className="mt-1 text-sm text-[#6E6E73]">
          Seguimiento del recorrido del cliente, desde la consulta inicial hasta la entrega del
          vehículo.
        </p>
      </div>

      {configError ? (
        <div className="rounded-2xl border border-[#FF9F0A]/30 bg-[#FF9F0A]/10 p-6 text-sm text-[#8A5300]">
          <p className="font-semibold">No se pudo conectar con Firestore.</p>
          <p className="mt-1">{configError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div
              key={column.stage}
              className="flex flex-col rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md"
            >
              <div className="mb-4 flex items-center justify-between border-b border-black/[0.06] pb-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#1D1D1F]">
                  {column.title}
                </h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F5F7] text-[10px] font-semibold text-[#6E6E73]">
                  {column.items.length}
                </span>
              </div>
              <div className="flex-1 space-y-3">
                {column.items.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[#8E8E93]">Sin consultas</p>
                ) : (
                  column.items.map((lead) => (
                    <div
                      key={lead.id}
                      className="cursor-pointer rounded-xl border border-black/[0.06] bg-[#F5F5F7]/80 p-3 transition-all active:scale-[0.98] hover:border-[#0071E3]/50"
                    >
                      <h4 className="text-xs font-semibold text-[#1D1D1F]">{lead.name}</h4>
                      <p className="mt-0.5 text-[11px] text-[#6E6E73]">
                        {vehicleLabel(lead.vehicleId)}
                      </p>
                      <p className="mt-2 text-[10px] font-medium text-[#8E8E93]">
                        {relativeTime(lead.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
