"use client";

import { useRef, useState } from "react";

type Props = {
  value?: string;
  onUploaded: (url: string) => void;
  label?: string;
};

export function ImageUploader({ value, onUploaded, label = "Subir imagen" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Error al subir la imagen.");
      onUploaded(data.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary uploaded URL
        <img
          src={value}
          alt="Vista previa"
          className="h-32 w-full rounded-xl border border-black/[0.06] object-cover"
        />
      )}
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-[#6E6E73] transition-all active:scale-[0.98] hover:border-[#0071E3] hover:text-[#0071E3]">
        {uploading ? "Subiendo…" : label}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
