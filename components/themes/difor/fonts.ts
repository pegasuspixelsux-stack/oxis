// difor theme typography. Inter is a neutral, highly legible humanist
// grotesque — the "well-run dealership" voice the brand calls for: clear
// hierarchy, no condensation, no decoration, comfortable in sentence or
// Title Case. IBM Plex Mono carries every figure (prices, monthly
// payments, spec values, the financing readout) so numbers line up in a
// fixed grid and read like a printed quote sheet. Inter ships a weight
// axis as a variable font (no `weight` needed); IBM Plex Mono is not
// variable, so its weights are listed explicitly. If next/font ever
// rejects a family, swap Inter for Work_Sans / Manrope and IBM_Plex_Mono
// for Roboto_Mono — nothing else in the theme depends on the specific
// faces.
import { Inter, IBM_Plex_Mono } from "next/font/google";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-difor-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-difor-mono",
  display: "swap",
});

export const diforFontClass = `${sans.variable} ${mono.variable}`;
// Usage: className="font-[family-name:var(--font-difor-sans)]" for body
// and headings, "font-[family-name:var(--font-difor-mono)]" for figures.
