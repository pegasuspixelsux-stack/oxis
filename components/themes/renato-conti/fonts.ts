// renato-conti theme typography — "Renato Conti Black Edition". The brand
// is a high-fashion house lookbook, not a car catalogue, so the display
// face is Josefin Sans: a geometric, elegant sans with very tall, thin
// letterforms that hold up large, airy and wide-tracked in uppercase
// eyebrows and headlines. It ships a weight axis as a variable font, so
// no `weight` array is needed. Manrope is the companion body sans — a
// quiet, even grotesque for the few lines of small copy. Manrope is
// variable too. If next/font ever rejects a family, swap Josefin_Sans
// for Jost / Raleway and Manrope for Inter — nothing else in the theme
// depends on the specific faces.
import { Josefin_Sans, Manrope } from "next/font/google";

const display = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-rc-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-rc-body",
  display: "swap",
});

export const renatoContiFontClass = `${display.variable} ${body.variable}`;
// Usage: className="font-[family-name:var(--font-rc-display)]" for
// headlines, eyebrows and micro-labels; "font-[family-name:var(--font-rc-body)]"
// for small body copy.
