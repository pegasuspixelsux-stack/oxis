"use client";

import { useParams } from "next/navigation";
import { useSettings } from "@/components/settings-provider";
import { resolveBrandTheme } from "@/lib/themes";
import { useCarDetail } from "@/lib/hooks/use-car-detail";
import { useLeadForm } from "@/lib/hooks/use-lead-form";
import { THEMES } from "./registry";
import { ThemeSkeleton } from "./ThemeSkeleton";
import { useThemeAttribute } from "./use-theme-attribute";

export function DetailThemeRouter() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { settings, loading: settingsLoading } = useSettings();
  const detail = useCarDetail(id);
  const leadForm = useLeadForm();
  const brand = resolveBrandTheme(settings.brandTheme);
  useThemeAttribute(brand);

  if (settingsLoading) return <ThemeSkeleton surface="detail" />;

  const { VehicleDetail } = THEMES[brand];
  return <VehicleDetail {...detail} leadForm={leadForm} />;
}
