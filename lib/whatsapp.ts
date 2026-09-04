// Builds a wa.me deep link from a dealership phone number (any punctuation)
// and an optional prefilled message. Shared by the public contact section,
// vehicle detail pages, and the Agente widget's WhatsApp hand-off.
export function buildWhatsAppLink(whatsappNumber: string, message?: string): string {
  const digits = whatsappNumber.replace(/[^0-9]/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
