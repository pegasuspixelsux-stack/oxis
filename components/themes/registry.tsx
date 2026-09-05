import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { BrandTheme } from "@/lib/themes";
import type { HomeProps, InventoryListProps, VehicleDetailProps } from "./types";
import { ThemeSkeleton } from "./ThemeSkeleton";

export type ThemeSurfaces = {
  Home: ComponentType<HomeProps>;
  InventoryList: ComponentType<InventoryListProps>;
  VehicleDetail: ComponentType<VehicleDetailProps>;
};

// Each surface is code-split so a visitor downloads only the active
// brand's bundle. To add a brand: create components/themes/<brand>/ with
// Home/InventoryList/VehicleDetail default exports, then add one entry
// here and one <option> in app/dashboard/settings/page.tsx. Nothing else.
export const THEMES: Record<BrandTheme, ThemeSurfaces> = {
  bmw: {
    Home: dynamic(() => import("./bmw/Home"), { loading: () => <ThemeSkeleton surface="home" /> }),
    InventoryList: dynamic(() => import("./bmw/InventoryList"), {
      loading: () => <ThemeSkeleton surface="list" />,
    }),
    VehicleDetail: dynamic(() => import("./bmw/VehicleDetail"), {
      loading: () => <ThemeSkeleton surface="detail" />,
    }),
  },
  mini: {
    Home: dynamic(() => import("./mini/Home"), { loading: () => <ThemeSkeleton surface="home" /> }),
    InventoryList: dynamic(() => import("./mini/InventoryList"), {
      loading: () => <ThemeSkeleton surface="list" />,
    }),
    VehicleDetail: dynamic(() => import("./mini/VehicleDetail"), {
      loading: () => <ThemeSkeleton surface="detail" />,
    }),
  },
  fiat: {
    Home: dynamic(() => import("./fiat/Home"), { loading: () => <ThemeSkeleton surface="home" /> }),
    InventoryList: dynamic(() => import("./fiat/InventoryList"), {
      loading: () => <ThemeSkeleton surface="list" />,
    }),
    VehicleDetail: dynamic(() => import("./fiat/VehicleDetail"), {
      loading: () => <ThemeSkeleton surface="detail" />,
    }),
  },
};
