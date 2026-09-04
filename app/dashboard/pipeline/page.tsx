const COLUMNS = [
  {
    title: "Consultas Nuevas",
    count: 4,
    items: [{ name: "Micaela Vance", vehicle: "2019 BMW M4", time: "hace 12m" }],
  },
  {
    title: "Contactados",
    count: 7,
    items: [{ name: "Amanda Ross", vehicle: "2022 Ford Expedition", time: "hace 2h" }],
  },
  {
    title: "Prueba Agendada",
    count: 3,
    items: [{ name: "Sara Jenkins", vehicle: "2018 Porsche Panamera", time: "hace 1d" }],
  },
  {
    title: "Financiación y Cierre",
    count: 2,
    items: [{ name: "Carlos Méndez", vehicle: "Tasación de canje", time: "hace 2d" }],
  },
];

export default function PipelinePage() {
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((column) => (
          <div
            key={column.title}
            className="flex flex-col rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md"
          >
            <div className="mb-4 flex items-center justify-between border-b border-black/[0.06] pb-3">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#1D1D1F]">
                {column.title}
              </h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F5F7] text-[10px] font-semibold text-[#6E6E73]">
                {column.count}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              {column.items.map((item) => (
                <div
                  key={item.name}
                  className="cursor-pointer rounded-xl border border-black/[0.06] bg-[#F5F5F7]/80 p-3 transition-all active:scale-[0.98] hover:border-[#0071E3]/50"
                >
                  <h4 className="text-xs font-semibold text-[#1D1D1F]">{item.name}</h4>
                  <p className="mt-0.5 text-[11px] text-[#6E6E73]">{item.vehicle}</p>
                  <p className="mt-2 text-[10px] font-medium text-[#8E8E93]">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#6E6E73]">
        * Datos de ejemplo hasta conectar el formulario de contacto a una base de datos.
      </p>
    </div>
  );
}
