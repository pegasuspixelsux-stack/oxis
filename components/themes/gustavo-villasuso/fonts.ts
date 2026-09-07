// gustavo-villasuso theme typography — "Gonzalo Vilasuso BMW, MINI &
// Mazda". The brand voice is a German engineering brochure: crisp,
// precise, confident, never condensed-aggressive and never thin-fashion.
// Chivo is the display face — a clean, engineered grotesque with a
// tight, mechanical rhythm that holds up bold (600-800) in the large
// headlines, the make captions and the spec-sheet labels. It ships a
// weight axis as a variable font, so no `weight` array is needed. Inter
// is the companion body sans — a neutral, highly legible grotesque for
// running copy, form fields and the finance readouts. Inter is variable
// too. If next/font ever rejects a family, swap Chivo for Archivo /
// Manrope and Inter for Work_Sans — nothing else in the theme depends on
// the specific faces.
import { Chivo, Inter } from "next/font/google";

const display = Chivo({
  subsets: ["latin"],
  variable: "--font-gv-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-gv-body",
  display: "swap",
});

export const gvFontClass = `${display.variable} ${body.variable}`;
// Usage: className="font-[family-name:var(--font-gv-display)]" for
// headlines, make captions and spec labels;
// "font-[family-name:var(--font-gv-body)]" for body copy and figures.
