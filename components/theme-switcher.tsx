"use client";

import { useState } from "react";
import { SunIcon, MoonIcon, FlameIcon, DropletIcon, LeafIcon } from "@/components/icons";

type Theme = "dark" | "light" | "red" | "blue" | "green";

const STORAGE_KEY = "oxis-theme";

const OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "dark", label: "Oscuro", icon: MoonIcon },
  { value: "light", label: "Claro", icon: SunIcon },
  { value: "red", label: "Rojo", icon: FlameIcon },
  { value: "blue", label: "Azul", icon: DropletIcon },
  { value: "green", label: "Verde", icon: LeafIcon },
];

function isTheme(value: string | null): value is Exclude<Theme, "dark"> {
  return value === "light" || value === "red" || value === "blue" || value === "green";
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");

  // Sync from the attribute the blocking init script already set, adjusting
  // state during render rather than in an effect to avoid an extra commit —
  // see https://react.dev/learn/you-might-not-need-an-effect.
  const [synced, setSynced] = useState(false);
  if (!synced && typeof document !== "undefined") {
    setSynced(true);
    const current = document.documentElement.getAttribute("data-theme");
    if (isTheme(current)) setTheme(current);
  }

  function applyTheme(next: Theme) {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme still applies for this visit.
    }
    if (next === "dark") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", next);
    }
  }

  return (
    <div>
      <span className="mb-2 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
        Elegí tu estilo
      </span>
      <div className="inline-flex gap-1.5 rounded-none border border-border-strong bg-bg-elevated-2 p-1">
        {OPTIONS.map((option) => {
          const active = option.value === theme;
          return (
            <button
              key={option.value}
              type="button"
              suppressHydrationWarning
              onClick={() => applyTheme(option.value)}
              aria-pressed={active}
              aria-label={option.label}
              title={option.label}
              className={`flex h-9 w-9 items-center justify-center rounded-none transition-colors ${
                active ? "bg-accent text-accent-fg" : "text-fg-muted hover:text-fg"
              }`}
            >
              <option.icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
