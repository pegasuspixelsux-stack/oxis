import { listLeads, LEAD_STAGE_LABELS, type Lead } from "@/lib/db/leads";
import { adminDb } from "@/lib/firebase-admin";
import { listCars } from "@/lib/db/seed-cars";
import type { Car } from "@/lib/db/cars";

// This reads live Firestore data on every request — never prerender/cache it.
export const dynamic = "force-dynamic";

function vehicleLabel(vehicleId: string | null, cars: Car[]): string {
  if (!vehicleId) return "Aún no está seguro";
  const car = cars.find((c) => c.id === vehicleId);
  return car ? car.title : vehicleId;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const STAGE_BADGE: Record<Lead["stage"], string> = {
  new: "bg-[#0071E3]/10 text-[#0071E3]",
  contacted: "bg-[#8E8E93]/15 text-[#3A3A3C]",
  "test-drive": "bg-[#34C759]/10 text-[#1F8B3F]",
  financing: "bg-[#FF9F0A]/10 text-[#B26B00]",
};

export default async function LeadsPage() {
  let leads: Lead[] = [];
  let cars: Car[] = [];
  let configError: string | null = null;

  try {
    [leads, cars] = await Promise.all([listLeads(), listCars(adminDb())]);
  } catch (error) {
    configError = error instanceof Error ? error.message : "Error desconocido.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#1D1D1F]">
            Gestión de Consultas
          </h1>
          <p className="mt-1 text-sm text-[#6E6E73]">
            Consultas de clientes, datos de contacto y estado inicial de cada una.
          </p>
        </div>
      </div>

      {configError ? (
        <div className="rounded-2xl border border-[#FF9F0A]/30 bg-[#FF9F0A]/10 p-6 text-sm text-[#8A5300]">
          <p className="font-semibold">No se pudo conectar con Firestore.</p>
          <p className="mt-1">{configError}</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white/60 p-10 text-center">
          <p className="text-sm font-medium text-[#1D1D1F]">Todavía no hay consultas.</p>
          <p className="mt-1 text-sm text-[#6E6E73]">
            Los envíos del formulario de contacto del sitio van a aparecer acá.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#F5F5F7]/60 font-mono text-xs uppercase tracking-wider text-[#6E6E73]">
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Contacto</th>
                  <th className="px-6 py-3 font-medium">Vehículo de interés</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] text-sm">
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-[#F5F5F7]/60">
                    <td className="px-6 py-4 font-semibold text-[#1D1D1F]">{lead.name}</td>
                    <td className="px-6 py-4 text-[#6E6E73]">
                      <div>{lead.email}</div>
                      <div className="mt-0.5 text-xs text-[#8E8E93]">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#6E6E73]">
                      {vehicleLabel(lead.vehicleId, cars)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STAGE_BADGE[lead.stage]}`}
                      >
                        {LEAD_STAGE_LABELS[lead.stage]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8E8E93]">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
