"use client";

import { useSettings } from "@/components/settings-provider";
import { resolveBrandTheme } from "@/lib/themes";
import { useInventoryData } from "@/lib/hooks/use-inventory-data";
import { THEMES } from "./registry";
import { useThemeAttribute } from "./use-theme-attribute";

// See HomeThemeRouter for why there is no settings-loading gate.
export function InventoryThemeRouter() {
  const { settings } = useSettings();
  const data = useInventoryData();
  const brand = resolveBrandTheme(settings.brandTheme);
  useThemeAttribute(brand);

  const { InventoryList } = THEMES[brand];
  return <InventoryList {...data} />;
}
