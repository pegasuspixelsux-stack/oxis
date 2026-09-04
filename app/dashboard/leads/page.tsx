const LEADS = [
  {
    id: 1,
    name: "Micaela Vance",
    email: "micaela@example.com",
    phone: "+598 99 234 567",
    vehicle: "2019 BMW M4",
    status: "Consulta nueva",
    date: "Hoy, 13:30",
  },
  {
    id: 2,
    name: "Sara Jenkins",
    email: "sara.j@example.com",
    phone: "+598 98 765 432",
    vehicle: "2018 Porsche Panamera",
    status: "Prueba agendada",
    date: "Hoy, 11:15",
  },
  {
    id: 3,
    name: "Carlos Méndez",
    email: "carlos@example.com",
    phone: "+598 97 456 789",
    vehicle: "Tasación de canje",
    status: "Revisión de documentos",
    date: "Ayer, 16:20",
  },
  {
    id: 4,
    name: "Amanda Ross",
    email: "amanda@example.com",
    phone: "+598 96 321 987",
    vehicle: "2022 Ford Expedition",
    status: "Contactado",
    date: "2 may. 2026",
  },
];

export default function LeadsPage() {
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
              {LEADS.map((lead) => (
                <tr key={lead.id} className="transition-colors hover:bg-[#F5F5F7]/60">
                  <td className="px-6 py-4 font-semibold text-[#1D1D1F]">{lead.name}</td>
                  <td className="px-6 py-4 text-[#6E6E73]">
                    <div>{lead.email}</div>
                    <div className="mt-0.5 text-xs text-[#8E8E93]">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#6E6E73]">{lead.vehicle}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-full bg-[#0071E3]/10 px-2.5 py-1 text-xs font-semibold text-[#0071E3]">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#8E8E93]">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[#6E6E73]">
        * Datos de ejemplo hasta conectar el formulario de contacto a una base de datos.
      </p>
    </div>
  );
}
