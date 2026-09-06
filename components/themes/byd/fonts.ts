// byd theme typography. A clean-tech electric-vehicle product site wants a
// sleek, engineered voice: Space Grotesk carries the display layer — big
// headings and the bold spec-callout numerals — with its slightly technical,
// mono-adjacent letterforms and tight tracking. Inter runs the body: neutral,
// highly legible, comfortable at paragraph sizes. Both ship a weight axis as
// variable fonts, so no explicit `weight` list is needed. If next/font ever
// rejects a family, swap Space_Grotesk for Sora and Inter for Manrope —
// nothing else in the theme depends on the specific faces.
import { Space_Grotesk, Inter } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-byd-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-byd-sans",
  display: "swap",
});

export const bydFontClass = `${display.variable} ${sans.variable}`;
// Usage: className="font-[family-name:var(--font-byd-sans)]" for body,
// "font-[family-name:var(--font-byd-display)]" for headings and spec numerals.
