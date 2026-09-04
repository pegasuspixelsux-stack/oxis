"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { CARS_COLLECTION, type Car, type CarSeed } from "@/lib/db/cars";
import { CloseIcon, UploadIcon } from "@/components/icons";
import { PhotoGuideDiagram } from "@/components/inventory/photo-guide-diagram";

type FormState = {
  title: string;
  make: string;
  bodyStyle: string;
  year: string;
  price: string;
  mileage: string;
  drivetrain: string;
  transmission: string;
  images: string[];
};

const MAX_IMAGES = 10;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const RESIZE_MAX_DIMENSION = 1200;
const RESIZE_JPEG_QUALITY = 0.8;

const EMPTY_FORM: FormState = {
  title: "",
  make: "",
  bodyStyle: "",
  year: String(new Date().getFullYear()),
  price: "",
  mileage: "",
  drivetrain: "",
  transmission: "Automatic",
  images: [],
};

function carToForm(car: Car): FormState {
  const images = car.images && car.images.length ? car.images : car.img ? [car.img] : [];
  return {
    title: car.title ?? "",
    make: car.make ?? "",
    bodyStyle: car.bodyStyle ?? "",
    year: String(car.year ?? new Date().getFullYear()),
    price: car.price ?? "",
    mileage: car.mileage ?? "",
    drivetrain: car.drivetrain ?? "",
    transmission: car.transmission ?? "Automatic",
    images,
  };
}

// Downscales an image file to at most RESIZE_MAX_DIMENSION on its longest
// side and re-encodes it as a JPEG, via an off-DOM <canvas> — keeps
// dealership photos (often multi-MB phone camera shots) small before they
// ever touch Storage, without needing a server round-trip.
async function resizeImage(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("No se pudo leer la imagen."));
    el.src = dataUrl;
  });

  let { width, height } = image;
  if (width > RESIZE_MAX_DIMENSION || height > RESIZE_MAX_DIMENSION) {
    if (width >= height) {
      height = Math.round((height * RESIZE_MAX_DIMENSION) / width);
      width = RESIZE_MAX_DIMENSION;
    } else {
      width = Math.round((width * RESIZE_MAX_DIMENSION) / height);
      height = RESIZE_MAX_DIMENSION;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no soporta el procesamiento de imágenes.");
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", RESIZE_JPEG_QUALITY)
  );
  if (!blob) throw new Error("No se pudo procesar la imagen.");
  return blob;
}

function uploadOne(blob: Blob, originalName: string, onProgress: (pct: number) => void): Promise<string> {
  const baseName = originalName.replace(/\.[^/.]+$/, "") || "foto";
  const objectPath = `car-inventory/${Date.now()}_${baseName}.jpg`;
  const storageRef = ref(storage, objectPath);
  const uploadTask = uploadBytesResumable(storageRef, blob, { contentType: "image/jpeg" });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      (uploadError) => reject(uploadError),
      async () => {
        try {
          resolve(await getDownloadURL(uploadTask.snapshot.ref));
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-[#F5F5F7] px-3.5 py-2.5 text-sm text-[#1D1D1F] outline-none transition-colors focus:border-[#0071E3] focus:bg-white";
const labelClasses = "mb-1.5 block text-xs font-medium text-[#6E6E73]";

export function VehicleFormModal({
  open,
  car,
  onClose,
  onSaved,
}: {
  open: boolean;
  car: Car | null;
  onClose: () => void;
  onSaved: (car: Car) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(car);

  // Re-seed the form whenever a different car is opened (or the modal opens
  // fresh for a new car), and reset upload/error state left over from a
  // previous open.
  useEffect(() => {
    if (!open) return;
    setForm(car ? carToForm(car) : EMPTY_FORM);
    setError("");
    setUploading(false);
    setUploadProgress(0);
  }, [open, car]);

  // Lock background scroll while the modal is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape to close, but not mid-save/upload — closing then would strand
  // an in-flight write with no way to see whether it finished.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving && !uploading) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, saving, uploading, onClose]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function removeImage(index: number) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  // images[0] is always the cover/hero shot everywhere it's rendered — this
  // lets an agent promote a later photo to that slot instead of being stuck
  // with whichever one happened to upload first.
  function makeCover(index: number) {
    setForm((prev) => {
      if (index <= 0 || index >= prev.images.length) return prev;
      const next = [...prev.images];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      return { ...prev, images: next };
    });
  }

  async function handleFilesSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (selected.length === 0) return;

    setError("");

    const remainingSlots = MAX_IMAGES - form.images.length;
    if (remainingSlots <= 0) {
      setError(`Ya alcanzaste el máximo de ${MAX_IMAGES} imágenes por vehículo.`);
      return;
    }

    const accepted = selected.slice(0, remainingSlots);
    const overflow = selected.length - accepted.length;

    const oversized = accepted.filter((f) => f.size > MAX_FILE_BYTES);
    const toUpload = accepted.filter((f) => f.size <= MAX_FILE_BYTES);

    const messages: string[] = [];
    if (overflow > 0) {
      messages.push(
        `Solo se agregaron ${accepted.length} foto${accepted.length === 1 ? "" : "s"} — el máximo es ${MAX_IMAGES} por vehículo.`
      );
    }
    if (oversized.length > 0) {
      messages.push(
        `${oversized.length} archivo${oversized.length === 1 ? "" : "s"} supera${oversized.length === 1 ? "" : "n"} los 5 MB y no se subió${oversized.length === 1 ? "" : "ron"}: ${oversized.map((f) => f.name).join(", ")}.`
      );
    }
    if (messages.length > 0) setError(messages.join(" "));

    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        setUploadLabel(`Subiendo foto ${i + 1} de ${toUpload.length}…`);
        setUploadProgress(0);
        const resized = await resizeImage(file);
        const url = await uploadOne(resized, file.name, setUploadProgress);
        setForm((prev) => ({ ...prev, images: [...prev.images, url].slice(0, MAX_IMAGES) }));
      }
    } catch (err) {
      console.error("[vehicle-form-modal] upload failed", err);
      setError((prev) => (prev ? prev + " " : "") + "No se pudo subir una de las imágenes. Intentá de nuevo.");
    } finally {
      setUploading(false);
      setUploadLabel("");
      setUploadProgress(0);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (uploading) return;

    if (!form.title.trim() || !form.make.trim()) {
      setError("Título y marca son obligatorios.");
      return;
    }
    if (form.images.length > MAX_IMAGES) {
      setError(`Un vehículo puede tener como máximo ${MAX_IMAGES} imágenes.`);
      return;
    }

    setSaving(true);
    setError("");

    const images = form.images.slice(0, MAX_IMAGES);
    const payload: CarSeed = {
      title: form.title.trim(),
      make: form.make.trim(),
      bodyStyle: form.bodyStyle.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      price: form.price.trim(),
      mileage: form.mileage.trim(),
      drivetrain: form.drivetrain.trim(),
      transmission: form.transmission.trim(),
      status: car?.status ?? "Published",
      img: images[0] ?? "",
      images,
    };

    try {
      if (car) {
        await updateDoc(doc(db, CARS_COLLECTION, car.id), payload);
        onSaved({ id: car.id, ...payload });
      } else {
        const ref = await addDoc(collection(db, CARS_COLLECTION), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        onSaved({ id: ref.id, ...payload });
      }
      onClose();
    } catch (err) {
      console.error("[vehicle-form-modal] save failed", err);
      setError("No se pudo guardar el vehículo. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!saving && !uploading) onClose();
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? "Editar vehículo" : "Agregar vehículo"}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
              <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
                {isEditing ? "Editar ficha del vehículo" : "Agregar vehículo"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!saving && !uploading) onClose();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6E6E73] transition-all active:scale-90 hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                aria-label="Cerrar"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <form
              id="vehicle-form"
              onSubmit={handleSubmit}
              className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
            >
              <div>
                <label className={labelClasses}>Título</label>
                <input
                  type="text"
                  required
                  placeholder="2021 BMW 330i xDrive"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="BMW"
                    value={form.make}
                    onChange={(e) => update("make", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Carrocería</label>
                  <input
                    type="text"
                    placeholder="Sedan"
                    value={form.bodyStyle}
                    onChange={(e) => update("bodyStyle", e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Año</label>
                  <input
                    type="number"
                    placeholder="2021"
                    value={form.year}
                    onChange={(e) => update("year", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Precio</label>
                  <input
                    type="text"
                    placeholder="$28,995"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Kilometraje</label>
                  <input
                    type="text"
                    placeholder="32,400 mi"
                    value={form.mileage}
                    onChange={(e) => update("mileage", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Tracción</label>
                  <input
                    type="text"
                    placeholder="AWD"
                    value={form.drivetrain}
                    onChange={(e) => update("drivetrain", e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Transmisión</label>
                <select
                  value={form.transmission}
                  onChange={(e) => update("transmission", e.target.value)}
                  className={inputClasses}
                >
                  <option value="Automatic">Automática</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="space-y-3 rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/60 p-4">
                <div className="flex items-center justify-between">
                  <label className={labelClasses}>Fotos del vehículo</label>
                  <span className="text-[11px] font-medium text-[#8E8E93]">
                    {form.images.length}/{MAX_IMAGES}
                  </span>
                </div>

                <div>
                  <p className="mb-2 text-[11px] text-[#6E6E73]">
                    Asegurate de tomar exactamente 10 fotos desde estas posiciones. El diagrama se
                    va completando a medida que subís fotos.
                  </p>
                  <PhotoGuideDiagram completedCount={form.images.length} />
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {form.images.map((url, i) => (
                      <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-black/[0.06]">
                        {/* eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary URL, not an app asset */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Quitar foto"
                        >
                          <CloseIcon className="h-2.5 w-2.5" />
                        </button>
                        {i === 0 ? (
                          <span className="absolute bottom-1 left-1 rounded-full bg-[#0071E3] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                            Portada
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => makeCover(i)}
                            className="absolute bottom-1 left-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-[#1D1D1F] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
                          >
                            Hacer portada
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <label
                  className={`inline-flex w-fit items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-[#6E6E73] transition-all active:scale-[0.98] ${
                    uploading || form.images.length >= MAX_IMAGES
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-[#0071E3] hover:text-[#0071E3]"
                  }`}
                >
                  <UploadIcon className="h-3.5 w-3.5" />
                  {uploading ? `${uploadLabel} ${uploadProgress}%` : "Subir fotos desde tu equipo"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelect}
                    disabled={uploading || form.images.length >= MAX_IMAGES}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-[#8E8E93]">
                  Hasta {MAX_IMAGES} fotos, 5 MB cada una. Se optimizan automáticamente al subirlas.
                </p>

                {uploading && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.08]">
                    <motion.div
                      className="h-full rounded-full bg-[#0071E3]"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 40 }}
                    />
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-black/[0.06] px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  if (!saving && !uploading) onClose();
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6E6E73] transition-all active:scale-[0.98] hover:text-[#1D1D1F]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="vehicle-form"
                disabled={saving || uploading}
                className="rounded-xl bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#0071E3]/90 disabled:opacity-50"
              >
                {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Agregar vehículo"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
