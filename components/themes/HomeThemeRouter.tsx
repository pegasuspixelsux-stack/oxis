"use client";

import { useSettings } from "@/components/settings-provider";
import { resolveBrandTheme } from "@/lib/themes";
import { useInventoryData } from "@/lib/hooks/use-inventory-data";
import { THEMES } from "./registry";
import { useThemeAttribute } from "./use-theme-attribute";

// No gate on settings loading: `settings` starts as DEFAULT_SETTINGS
// (brandTheme "bmw"), so the resolved theme renders immediately — SSR and
// first paint included — instead of waiting for the Firestore settings
// listener to hand-shake. When the real snapshot arrives, the router
// re-renders; a different brand swaps in then (dynamic() shows the
// skeleton while that chunk loads). The overwhelmingly common case —
// the active brand equals the default — costs nothing.
export function HomeThemeRouter() {
  const { settings } = useSettings();
  const data = useInventoryData();
  const brand = resolveBrandTheme(settings.brandTheme);
  useThemeAttribute(brand);

  const { Home } = THEMES[brand];
  return <Home {...data} />;
}
