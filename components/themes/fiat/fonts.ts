// Fiat theme: a warm rounded humanist. Mulish reads friendly at small
// sizes and has a light display weight for headings, which suits the
// compact, Italian-warm layout. If next/font ever rejects the family,
// swap to another rounded grotesque (e.g. Nunito Sans) — nothing else
// in the theme depends on the specific face.
import { Mulish } from "next/font/google";

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-fiat",
  display: "swap",
});

export const fiatFontClass = mulish.variable;
// Usage in components: className="font-[family-name:var(--font-fiat)]"
