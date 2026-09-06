// MINI theme typography. Archivo is a bold geometric grotesque that
// covers both the chunky uppercase display type and clean body copy, so
// the whole surface runs on one variable font. The `wdth` axis gives the
// headlines their slightly widened, poster-like stance; if next/font ever
// rejects the axis, drop `axes` and fall back to explicit heavy weights.
import { Archivo } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-mini",
  display: "swap",
  axes: ["wdth"],
});

export const miniFontClass = archivo.variable;
// Usage in components: className="font-[family-name:var(--font-mini)]"
