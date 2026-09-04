"use client";

import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSettings } from "@/components/settings-provider";
import {
  SETTINGS_COLLECTION,
  SETTINGS_DOC_ID,
  type DealershipSettings,
  type StaffMember,
} from "@/lib/db/settings";
import { PlusIcon, TrashIcon } from "@/components/icons";

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-[#F5F5F7] px-3.5 py-2.5 text-sm text-[#1D1D1F] outline-none transition-colors focus:border-[#0071E3] focus:bg-white";
const labelClasses = "mb-1.5 block text-xs font-medium text-[#6E6E73]";

function newStaffId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `staff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function DashboardSettingsPage() {
  const { settings, loading } = useSettings();
  const [form, setForm] = useState<DealershipSettings>(settings);
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Seed the editable form from the live settings exactly once they arrive
  // — after that, local edits are the source of truth until Save. Without
  // the `seeded` guard, every onSnapshot tick (including our own save
  // round-tripping back) would stomp on whatever the admin is mid-typing.
  useEffect(() => {
    if (!loading && !seeded) {
      setForm(settings);
      setSeeded(true);
    }
  }, [loading, seeded, settings]);

  function update<K extends keyof DealershipSettings>(key: K, value: DealershipSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function addStaff() {
    update("staff", [...form.staff, { id: newStaffId(), name: "", role: "" }]);
  }

  function updateStaff(id: string, patch: Partial<StaffMember>) {
    update(
      "staff",
      form.staff.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  function removeStaff(id: string) {
    update(
      "staff",
      form.staff.filter((s) => s.id !== id)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const cleanStaff = form.staff
        .map((s) => ({ ...s, name: s.name.trim(), role: s.role.trim() }))
        .filter((s) => s.name.length > 0);

      await setDoc(
        doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
        { ...form, staff: cleanStaff },
        { merge: true }
      );
      setForm((prev) => ({ ...prev, staff: cleanStaff }));
      setSaved(true);
    } catch (err) {
      console.error("[dashboard/settings] save failed", err);
      setError("No se pudo guardar la configuración. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !seeded) {
    return (
      <div className="flex h-40 items-center justify-center text-sm font-medium text-[#6E6E73]">
        Cargando configuración…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#1D1D1F]">Configuración</h1>
        <p className="mt-1 text-sm text-[#6E6E73]">
          Datos del concesionario que se usan en todo el sitio público — encabezado, pie de
          página, contacto y fichas de vehículo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-2">
          <div>
            <label className={labelClasses}>Nombre del concesionario</label>
            <input
              type="text"
              value={form.dealershipName}
              onChange={(e) => update("dealershipName", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Teléfono</label>
            <input
              type="text"
              placeholder="+598 2600 1234"
              value={form.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>WhatsApp</label>
            <input
              type="text"
              placeholder="+598 99 123 456"
              value={form.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              className={inputClasses}
            />
            <p className="mt-1 text-[11px] text-[#8E8E93]">
              Usado para los enlaces de WhatsApp del sitio y del widget Agente.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClasses}>Horario de atención</label>
            <textarea
              rows={3}
              value={form.businessHours}
              onChange={(e) => update("businessHours", e.target.value)}
              placeholder={"Lunes a Viernes: 9:00–19:00\nSábado: 9:00–18:00\nDomingo: Cerrado"}
              className={`${inputClasses} resize-none`}
            />
            <p className="mt-1 text-[11px] text-[#8E8E93]">Una línea por renglón.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClasses}>Imagen de portada (hero) por defecto</label>
            {form.heroBannerImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary URL
              <img
                src={form.heroBannerImageUrl}
                alt="Vista previa del banner"
                className="mb-2 h-32 w-full rounded-xl border border-black/[0.06] object-cover"
              />
            )}
            <input
              type="text"
              placeholder="https://images.unsplash.com/…"
              value={form.heroBannerImageUrl}
              onChange={(e) => update("heroBannerImageUrl", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#1D1D1F]">Equipo</h2>
              <p className="mt-0.5 text-xs text-[#6E6E73]">
                Personas disponibles para asignar consultas en el pipeline.
              </p>
            </div>
            <button
              type="button"
              onClick={addStaff}
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-[#6E6E73] transition-all active:scale-[0.98] hover:border-[#0071E3] hover:text-[#0071E3]"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Agregar
            </button>
          </div>

          {form.staff.length === 0 ? (
            <p className="mt-4 text-sm text-[#8E8E93]">Todavía no agregaste integrantes del equipo.</p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {form.staff.map((member) => (
                <div key={member.id} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={member.name}
                    onChange={(e) => updateStaff(member.id, { name: e.target.value })}
                    className={`${inputClasses} flex-1`}
                  />
                  <input
                    type="text"
                    placeholder="Rol (opcional)"
                    value={member.role}
                    onChange={(e) => updateStaff(member.id, { role: e.target.value })}
                    className={`${inputClasses} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeStaff(member.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8E8E93] transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Quitar integrante"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#0071E3]/90 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
          {saved && <span className="text-xs font-medium text-[#1F8B3F]">Guardado ✓</span>}
        </div>
      </form>
    </div>
  );
}
