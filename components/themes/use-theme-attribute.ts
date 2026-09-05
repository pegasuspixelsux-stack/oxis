"use client";

import { useEffect } from "react";
import type { BrandTheme } from "@/lib/themes";

// The visitor colour-switcher (light/red/blue/green) is a BMW-only
// feature: it writes localStorage "oxis-theme" and app/layout.tsx's init
// script mirrors that onto <html data-theme>. MINI and Fiat ship their
// own self-contained palettes and must not inherit a stale
// [data-theme="red"] block from globals.css, so strip the attribute for
// any non-BMW brand. BMW leaves it exactly as the init script set it.
export function useThemeAttribute(brand: BrandTheme) {
  useEffect(() => {
    if (brand === "bmw") return;
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.removeAttribute("data-theme");
    return () => {
      if (previous) root.setAttribute("data-theme", previous);
    };
  }, [brand]);
}
