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
  type QualificationQuestion,
} from "@/lib/db/settings";
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@/components/icons";
import { BRAND_THEMES } from "@/lib/themes";

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-[#F5F5F7] px-3.5 py-2.5 text-sm text-[#1D1D1F] outline-none transition-colors focus:border-[#0071E3] focus:bg-white";
const labelClasses = "mb-1.5 block text-xs font-medium text-[#6E6E73]";

const BRAND_THEME_LABELS: Record<(typeof BRAND_THEMES)[number], string> = {
  bmw: "BMW",
  mini: "MINI",
  fiat: "Fiat",
  "rs-motors": "RS Motors",
  difor: "Difor",
  voituret: "Voituret",
  carmax: "CarMax",
  "renato-conti": "Renato Conti Black Edition",
  "gustavo-villasuso": "Gustavo Villasuso",
};

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

  function addQuestion() {
    const question: QualificationQuestion = {
      id: newStaffId(),
      text: "",
      enabled: true,
      order: form.qualificationQuestions.length,
    };
    update("qualificationQuestions", [...form.qualificationQuestions, question]);
  }

  function updateQuestion(id: string, patch: Partial<QualificationQuestion>) {
    update(
      "qualificationQuestions",
      form.qualificationQuestions.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
  }

  function removeQuestion(id: string) {
    update(
      "qualificationQuestions",
      form.qualificationQuestions.filter((q) => q.id !== id)
    );
  }

  // Array position is the source of truth for display order — `order` is
  // just what gets persisted, recomputed from the new position on every
  // move so a reload always sorts back into the order shown here.
  function moveQuestion(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.qualificationQuestions.length) return;
    const next = [...form.qualificationQuestions];
    [next[index], next[target]] = [next[target], next[index]];
    update(
      "qualificationQuestions",
      next.map((q, i) => ({ ...q, order: i }))
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
      const cleanQuestions = form.qualificationQuestions
        .map((q) => ({ ...q, text: q.text.trim() }))
        .filter((q) => q.text.length > 0);

      await setDoc(
        doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
        { ...form, staff: cleanStaff, qualificationQuestions: cleanQuestions },
        { merge: true }
      );
      setForm((prev) => ({ ...prev, staff: cleanStaff, qualificationQuestions: cleanQuestions }));
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
          <div className="sm:col-span-2">
            <label className={labelClasses}>Tema de marca (sitio público)</label>
            <select
              value={form.brandTheme}
              onChange={(e) => update("brandTheme", e.target.value as typeof form.brandTheme)}
              className={inputClasses}
            >
              {BRAND_THEMES.map((t) => (
                <option key={t} value={t}>
                  {BRAND_THEME_LABELS[t]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[#8E8E93]">
              Cambia por completo el diseño de la página pública, el inventario y las fichas.
            </p>
          </div>
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

        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#1D1D1F]">Preguntas del widget Agente</h2>
              <p className="mt-0.5 text-xs text-[#6E6E73]">
                El orden y las preguntas activas acá son exactamente lo que Agente le pregunta a un
                visitante del sitio.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClasses}>Mensaje de bienvenida</label>
            <textarea
              rows={2}
              value={form.agenteGreeting}
              onChange={(e) => update("agenteGreeting", e.target.value)}
              className={`${inputClasses} resize-none`}
            />
            <p className="mt-1 text-[11px] text-[#8E8E93]">
              Lo primero que ve un visitante al abrir el widget, antes de la primera pregunta.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">Preguntas</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-[#6E6E73] transition-all active:scale-[0.98] hover:border-[#0071E3] hover:text-[#0071E3]"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Agregar pregunta
            </button>
          </div>

          {form.qualificationQuestions.length === 0 ? (
            <p className="mt-4 text-sm text-[#8E8E93]">No hay preguntas configuradas.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {form.qualificationQuestions.map((question, index) => (
                <div key={question.id} className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, -1)}
                      disabled={index === 0}
                      className="flex h-5 w-6 items-center justify-center text-[#8E8E93] transition-colors hover:text-[#1D1D1F] disabled:opacity-25"
                      aria-label="Subir"
                    >
                      <ArrowUpIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 1)}
                      disabled={index === form.qualificationQuestions.length - 1}
                      className="flex h-5 w-6 items-center justify-center text-[#8E8E93] transition-colors hover:text-[#1D1D1F] disabled:opacity-25"
                      aria-label="Bajar"
                    >
                      <ArrowDownIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Texto de la pregunta"
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                    className={`${inputClasses} flex-1 ${question.enabled ? "" : "opacity-50"}`}
                  />
                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-medium text-[#6E6E73]">
                    <input
                      type="checkbox"
                      checked={question.enabled}
                      onChange={(e) => updateQuestion(question.id, { enabled: e.target.checked })}
                      className="h-3.5 w-3.5 accent-[#0071E3]"
                    />
                    Activa
                  </label>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8E8E93] transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Quitar pregunta"
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
