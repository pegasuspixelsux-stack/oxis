"use client";

import { useRef, useState } from "react";

type Props = {
  kind: "image" | "video";
  value?: string;
  onUploaded: (url: string) => void;
  label?: string;
};

const ACCEPT: Record<Props["kind"], string> = {
  image: "image/png,image/jpeg,image/webp,image/avif",
  video: "video/mp4,video/webm",
};

// Uploads a single image or video to /api/upload (Firebase Storage) and
// hands back the public URL. Generalization of components/image-uploader.tsx
// — used by the dashboard settings form for theme hero backgrounds.
export function MediaUploader({ kind, value, onUploaded, label }: Props) {
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
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Error al subir el archivo.");
      onUploaded(data.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const defaultLabel = kind === "video" ? "Subir video" : "Subir imagen";

  return (
    <div className="flex flex-col gap-2">
      {value &&
        (kind === "video" ? (
          <video
            src={value}
            muted
            loop
            playsInline
            autoPlay
            className="h-32 w-full rounded-xl border border-black/[0.06] object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary uploaded URL
          <img
            src={value}
            alt="Vista previa"
            className="h-32 w-full rounded-xl border border-black/[0.06] object-cover"
          />
        ))}
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-[#6E6E73] transition-all active:scale-[0.98] hover:border-[#0071E3] hover:text-[#0071E3]">
        {uploading ? "Subiendo…" : (label ?? defaultLabel)}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[kind]}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
