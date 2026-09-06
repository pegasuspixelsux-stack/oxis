// voituret theme typography. The brand is an ultra-luxury boutique
// editorial — an auction-house catalogue, not a brochure — so the
// headline face is Cormorant Garamond: a high-contrast Garamond revival
// with tall ascenders and a light default weight that carries large,
// airy display lines. It ships a weight axis as a variable font, so no
// `weight` array is needed. Jost is the companion sans: a geometric
// grotesque with a wide, even rhythm that sits well in small,
// letter-spaced small-caps eyebrow labels and quiet body copy. Jost is
// variable too. If next/font ever rejects a family, swap Cormorant
// Garamond for EB_Garamond / Playfair_Display and Jost for
// Nunito_Sans — nothing else in the theme depends on the specific faces.
import { Cormorant_Garamond, Jost } from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-voituret-serif",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin"],
  variable: "--font-voituret-sans",
  display: "swap",
});

export const voituretFontClass = `${serif.variable} ${sans.variable}`;
// Usage: className="font-[family-name:var(--font-voituret-serif)]" for
// display headlines and "font-[family-name:var(--font-voituret-sans)]"
// for body copy, labels and eyebrows.
