import type { Car } from "@/lib/db/cars";
import type { InventoryFilter } from "@/lib/hooks/use-inventory-data";
import type { LeadPayload } from "@/lib/hooks/use-lead-form";

export type { LeadPayload };

export type LeadFormApi = {
  submit: (payload: LeadPayload) => Promise<void>;
  submitting: boolean;
  success: boolean;
  error: string;
  reset: () => void;
};

// Props every theme's <Home> receives from HomeThemeRouter.
export type HomeProps = {
  cars: Car[];
  loading: boolean;
  availableMakes: string[];
  availableBodyStyles: string[];
  priceCeiling: number;
  filterCars: (f: InventoryFilter) => Car[];
};

// Props every theme's <InventoryList> receives from InventoryThemeRouter.
export type InventoryListProps = HomeProps;

// Props every theme's <VehicleDetail> receives from DetailThemeRouter.
export type VehicleDetailProps = {
  car: Car | null;
  loading: boolean;
  notFound: boolean;
  leadForm: LeadFormApi;
};
