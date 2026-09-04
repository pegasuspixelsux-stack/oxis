import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OXIS Auto — Usados Certificados de Alto Rendimiento y Lujo",
  description:
    "Vehículos de alto rendimiento, lujo y uso diario seleccionados a mano, cada uno respaldado por una inspección de 150 puntos, precios transparentes y una garantía de devolución de 7 días.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("oxis-theme");
    if (theme === "light" || theme === "red" || theme === "blue" || theme === "green") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-UY"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
