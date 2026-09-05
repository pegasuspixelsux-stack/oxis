// Shared, client-safe types + defaults for the single global dealership
// settings document at settings/general. Zero firebase-admin import (same
// reasoning as lib/db/cars.ts) — the public site (header, footer, contact
// section, hero, vehicle detail pages) and the dashboard settings form
// both import this module directly.

import type { BrandTheme } from "@/lib/themes";

export const SETTINGS_COLLECTION = "settings";
export const SETTINGS_DOC_ID = "general";

export type StaffMember = {
  id: string;
  name: string;
  role: string;
};

export type QualificationQuestion = {
  id: string;
  text: string;
  enabled: boolean;
  order: number;
};

export type DealershipSettings = {
  dealershipName: string;
  address: string;
  whatsappNumber: string;
  phoneNumber: string;
  businessHours: string;
  heroBannerImageUrl: string;
  staff: StaffMember[];
  qualificationQuestions: QualificationQuestion[];
  agenteGreeting: string;
  brandTheme: BrandTheme;
};

// The default qualification flow the Agente concierge widget walks a
// visitor through. Lives here (not in the widget) so both the widget and
// the dashboard's settings editor share one source of truth.
export const DEFAULT_QUALIFICATION_QUESTIONS: QualificationQuestion[] = [
  { id: "vehicle", text: "¿Qué vehículo te interesa?", enabled: true, order: 0 },
  { id: "budget", text: "¿Cuál es tu presupuesto aproximado?", enabled: true, order: 1 },
  { id: "timeline", text: "¿Cuándo te gustaría comprar?", enabled: true, order: 2 },
  { id: "trade-in", text: "¿Tenés un vehículo para entregar en parte de pago?", enabled: true, order: 3 },
  { id: "financing", text: "¿Cómo preferís pagar?", enabled: true, order: 4 },
  { id: "test-drive", text: "¿Querés agendar una prueba de manejo?", enabled: true, order: 5 },
  { id: "name", text: "¿Cuál es tu nombre?", enabled: true, order: 6 },
  { id: "contact", text: "¿Cuál es tu email o teléfono de contacto?", enabled: true, order: 7 },
  { id: "callback-time", text: "¿Cuándo preferís que te contactemos?", enabled: true, order: 8 },
];

// Used to seed a brand-new document and as a fallback while the real
// document is still loading — keeps every consumer rendering something
// sensible instead of blank/undefined fields.
export const DEFAULT_SETTINGS: DealershipSettings = {
  dealershipName: "OXIS Auto",
  address: "Av. Italia 3542, Montevideo, Uruguay",
  whatsappNumber: "+598 2600 1234",
  phoneNumber: "+598 2600 1234",
  businessHours: "Lunes a Viernes: 9:00–19:00\nSábado: 9:00–18:00\nDomingo: Cerrado",
  heroBannerImageUrl: "https://images.unsplash.com/photo-1493238792000-8113da705763",
  staff: [],
  qualificationQuestions: DEFAULT_QUALIFICATION_QUESTIONS,
  agenteGreeting:
    "¡Hola! 👋 Soy tu asesor comercial virtual. Estoy para ayudarte a encontrar el auto ideal — empecemos.",
  brandTheme: "bmw",
};
