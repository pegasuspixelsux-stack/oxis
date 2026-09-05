// BMW theme keeps the site's original typefaces (Geist / Geist Mono) so
// the moved markup's font-sans / font-mono utilities render exactly as
// before. Re-declared here rather than imported from app/layout.tsx to
// keep every theme's fonts inside its own folder.
import { Geist, Geist_Mono } from "next/font/google";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// app/layout.tsx already sets these variables on <html>, so applying this
// className is belt-and-suspenders — harmless and keeps the theme
// self-describing.
export const bmwFontClass = `${sans.variable} ${mono.variable}`;
