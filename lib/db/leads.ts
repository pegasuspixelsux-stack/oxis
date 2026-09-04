import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export type LeadStage = "new" | "contacted" | "test-drive" | "financing";

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "Consulta nueva",
  contacted: "Contactado",
  "test-drive": "Prueba agendada",
  financing: "Financiación y cierre",
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
  vehicleId: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  message: string;
  stage: LeadStage;
  createdAt: string; // ISO 8601
};

const COLLECTION = "leads";

export type NewLead = Omit<Lead, "id" | "stage" | "createdAt">;

export async function createLead(data: NewLead): Promise<string> {
  const db = adminDb();
  const ref = await db.collection(COLLECTION).add({
    ...data,
    stage: "new" satisfies LeadStage,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function listLeads(): Promise<Lead[]> {
  const db = adminDb();
  const snap = await db.collection(COLLECTION).orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.() as Date | undefined;
    return {
      id: doc.id,
      name: (data.name as string) ?? "",
      email: (data.email as string) ?? "",
      phone: (data.phone as string) ?? "",
      preferredContact: (data.preferredContact as string) ?? "Email",
      vehicleId: (data.vehicleId as string) ?? null,
      preferredDate: (data.preferredDate as string) ?? null,
      preferredTime: (data.preferredTime as string) ?? null,
      message: (data.message as string) ?? "",
      stage: (data.stage as LeadStage) ?? "new",
      createdAt: createdAt ? createdAt.toISOString() : new Date().toISOString(),
    };
  });
}
