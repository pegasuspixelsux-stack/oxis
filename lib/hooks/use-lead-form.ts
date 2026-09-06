"use client";

import { useCallback, useState } from "react";

export type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  preferredContact?: string;
  vehicleId?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
};

// The POST to /api/contact that the homepage contact form and every
// theme's vehicle-detail lead form share. /api/contact normalizes the
// lead into the shape lib/db/leads.ts + the dashboard pipeline expect,
// so themes must go through here rather than writing Firestore directly.
export function useLeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = useCallback(async (payload: LeadPayload) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo enviar la consulta.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la consulta.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSubmitting(false);
    setSuccess(false);
    setError("");
  }, []);

  return { submit, submitting, success, error, reset };
}
