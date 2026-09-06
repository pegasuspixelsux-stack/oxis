// carmax theme typography. The brand is a high-volume generalist
// marketplace — a busy classifieds grid, not a brochure — so the voice is
// a plain workhorse sans with no personality of its own: IBM Plex Sans.
// It stays compact and legible at the small sizes a dense results grid
// needs, in filter labels, badges and spec rows alike. IBM Plex Mono
// carries every figure (list prices, monthly estimates, page numbers, the
// finance readout) so numbers line up in a fixed grid like a printed
// price sheet. IBM Plex Sans ships a weight axis as a variable font (no
// `weight` needed); IBM Plex Mono is not variable, so its weights are
// listed explicitly. If next/font ever rejects a family, swap IBM Plex
// Sans for Work_Sans / Inter and IBM Plex Mono for Roboto_Mono — nothing
// else in the theme depends on the specific faces.
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-carmax-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-carmax-mono",
  display: "swap",
});

export const carmaxFontClass = `${sans.variable} ${mono.variable}`;
// Usage: className="font-[family-name:var(--font-carmax-sans)]" for body
// and headings, "font-[family-name:var(--font-carmax-mono)]" for figures.
