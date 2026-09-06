// rs-motors theme typography. Oswald is a sharp, condensed grotesque
// built for uppercase headlines with tight tracking — the motorsport
// poster look the brand direction calls for. JetBrains Mono drives every
// technical readout (spec sheets, telemetry panels, price tickers) so
// numbers align in a fixed grid like an instrument cluster. Both are
// variable Google fonts (weight axis only), so no `weight`/`axes` option
// is needed; if next/font ever rejects a family, swap Oswald for
// Archivo_Black / Chakra_Petch and JetBrains_Mono for Roboto_Mono —
// nothing else in the theme depends on the specific faces.
import { Oswald, JetBrains_Mono } from "next/font/google";

const display = Oswald({
  subsets: ["latin"],
  variable: "--font-rs-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-rs-mono",
  display: "swap",
});

export const rsMotorsFontClass = `${display.variable} ${mono.variable}`;
// Usage: className="font-[family-name:var(--font-rs-display)]" for display
// type, "font-[family-name:var(--font-rs-mono)]" for stats / readouts.
