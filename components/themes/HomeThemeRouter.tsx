"use client";

import { useSettings } from "@/components/settings-provider";
import { resolveBrandTheme } from "@/lib/themes";
import { useInventoryData } from "@/lib/hooks/use-inventory-data";
import { THEMES } from "./registry";
import { ThemeSkeleton } from "./ThemeSkeleton";
import { useThemeAttribute } from "./use-theme-attribute";

export function HomeThemeRouter() {
  const { settings, loading: settingsLoading } = useSettings();
  const data = useInventoryData();
  const brand = resolveBrandTheme(settings.brandTheme);
  useThemeAttribute(brand);

  if (settingsLoading) return <ThemeSkeleton surface="home" />;

  const { Home } = THEMES[brand];
  return <Home {...data} />;
}
