"use client";

import { useSettings } from "@/components/settings-provider";
import { resolveBrandTheme } from "@/lib/themes";
import { useInventoryData } from "@/lib/hooks/use-inventory-data";
import { THEMES } from "./registry";
import { ThemeSkeleton } from "./ThemeSkeleton";
import { useThemeAttribute } from "./use-theme-attribute";

export function InventoryThemeRouter() {
  const { settings, loading: settingsLoading } = useSettings();
  const data = useInventoryData();
  const brand = resolveBrandTheme(settings.brandTheme);
  useThemeAttribute(brand);

  if (settingsLoading) return <ThemeSkeleton surface="list" />;

  const { InventoryList } = THEMES[brand];
  return <InventoryList {...data} />;
}
