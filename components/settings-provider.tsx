"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SETTINGS_COLLECTION, SETTINGS_DOC_ID, DEFAULT_SETTINGS, type DealershipSettings } from "@/lib/db/settings";

type SettingsContextValue = {
  settings: DealershipSettings;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: true,
});

// Wraps the whole app (see app/layout.tsx) with a live view of
// settings/general — every public component (header, footer, contact,
// hero, vehicle detail pages) and the dashboard settings form itself read
// through useSettings() instead of duplicating a Firestore read. Uses
// onSnapshot so an edit in the dashboard reflects on the live site
// immediately, with no page reload.
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DealershipSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
      (snap) => {
        setSettings(snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS);
        setLoading(false);
      },
      (error) => {
        console.error("[settings-provider] failed to load settings/general", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return <SettingsContext.Provider value={{ settings, loading }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
