"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ShowroomContextValue = {
  selectedVehicleId: string | null;
  selectVehicle: (id: string) => void;
  clearVehicle: () => void;
};

const ShowroomContext = createContext<ShowroomContextValue | null>(null);

export function ShowroomProvider({ children }: { children: ReactNode }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const value = useMemo<ShowroomContextValue>(
    () => ({
      selectedVehicleId,
      selectVehicle: (id: string) => setSelectedVehicleId(id),
      clearVehicle: () => setSelectedVehicleId(null),
    }),
    [selectedVehicleId]
  );

  return <ShowroomContext.Provider value={value}>{children}</ShowroomContext.Provider>;
}

export function useShowroom() {
  const ctx = useContext(ShowroomContext);
  if (!ctx) {
    throw new Error("useShowroom must be used within a ShowroomProvider");
  }
  return ctx;
}
