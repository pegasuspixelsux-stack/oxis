# Multi-Theme Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a dashboard "Brand Theme" setting (BMW / MINI / Fiat) swap the entire visual system of the three public pages, while Firestore data, the dashboard, API routes, and other brand themes stay untouched.

**Architecture:** Three shared client hooks own all Firestore reads and the `/api/contact` POST. A static typed registry maps `brandTheme` → `{ Home, InventoryList, VehicleDetail }` with `next/dynamic` code-splitting. Three thin client "router" components read `settings.brandTheme` (from the existing `SettingsProvider`), call the relevant hook, and render the active brand's surface with typed props. Each `components/themes/<brand>/` folder is fully self-contained (layout, components, fonts) and is the only place brand styling is ever edited.

**Tech Stack:** Next.js 16.3.4 (App Router, Turbopack), React 19, Firebase Web SDK (client), Tailwind CSS v4, `motion`, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-09-05-multi-theme-architecture-design.md` — read it before starting. This plan argues from that spec.

## Global Constraints

- **No test runner exists.** `package.json` has no test script or deps. Every task's verification is `npm run build` (Turbopack typecheck + ESLint — the same gate the deploy pipeline runs) **plus**, where noted, a manual browser walkthrough via `npm run dev`. Do **not** add a test framework.
- **Per `AGENTS.md`, this is a modified Next.js.** Before writing any code that uses `next/dynamic`, `next/font`, `useParams`, or client-component patterns, read the matching guide under `node_modules/next/dist/docs/01-app/`. Heed deprecation notices. Commit the auto-regenerated `AGENTS.md` block if `next dev` rewrites it.
- **Change boundaries (hard rule after Task 13):**
  - FROZEN — never edit for theme work: `app/dashboard/**`, `app/api/**`, `lib/firebase*`, `lib/db/**`, `app/layout.tsx`, `app/globals.css`, `lib/hooks/**`, `lib/themes.ts`, `components/themes/registry.tsx`, `components/themes/types.ts`, `components/themes/*Router.tsx`, `components/themes/ThemeSkeleton.tsx`, `components/themes/use-theme-attribute.ts`, and any other brand's `components/themes/<other>/**`.
  - FREE — brand work lives here only: `components/themes/<brand>/**`.
  - Adding a brand later = new folder + one line in `registry.tsx` + one `<option>` in the dashboard select. Nothing else.
- **A theme file must never** import `firebase`, `@/lib/firebase`, `@/lib/db/*`, or call `/api/*`. It receives data through props only. It **may** import read-only shared utils: `@/lib/finance`, `@/lib/vehicles`, `@/lib/whatsapp`, `@/components/icons`, `@/components/reveal`, `@/components/showroom-context`.
- **`bmw` theme = today's site, byte-for-byte.** The move tasks change import paths only, never markup or classes.
- Commit after every task. Branch is `build-oxis-auto-site` (the working branch); commit directly to it, matching repo convention.
- Language of all user-facing copy: Spanish (es-UY), matching existing pages.

---

## File Structure

**Created (shared core — Tasks 1–7, 12):**
| File | Responsibility |
|---|---|
| `lib/themes.ts` | `BRAND_THEMES` tuple, `BrandTheme` type, `DEFAULT_BRAND_THEME`, `resolveBrandTheme()` |
| `lib/hooks/use-inventory-data.ts` | Fetch `cars`, derive `availableMakes` / `availableBodyStyles` / `priceCeiling`, expose `filterCars()` |
| `lib/hooks/use-car-detail.ts` | Fetch one car by id → `{ car, loading, notFound }` |
| `lib/hooks/use-lead-form.ts` | POST `/api/contact` → `{ submit, submitting, success, error, reset }` |
| `components/themes/types.ts` | `HomeProps`, `InventoryListProps`, `VehicleDetailProps`, `LeadPayload`, `LeadFormApi` |
| `components/themes/ThemeSkeleton.tsx` | Neutral full-page placeholder shown while settings load |
| `components/themes/use-theme-attribute.ts` | Keep `<html data-theme>` for `bmw`; strip it for other brands |
| `components/themes/registry.tsx` | `THEMES: Record<BrandTheme, ThemeSurfaces>` via `next/dynamic` |
| `components/themes/HomeThemeRouter.tsx` | Client. `useInventoryData()` + `useSettings()` → active `Home` |
| `components/themes/InventoryThemeRouter.tsx` | Client. `useInventoryData()` → active `InventoryList` |
| `components/themes/DetailThemeRouter.tsx` | Client. `useParams` id + `useCarDetail()` → active `VehicleDetail` |

**Created (BMW theme — Tasks 8–11), all under `components/themes/bmw/`:**
`Home.tsx`, `InventoryList.tsx`, `VehicleDetail.tsx`, `fonts.ts`, `site-header.tsx`, `site-footer.tsx`, `theme-switcher.tsx`, `hero-section.tsx`, `intro-section.tsx`, `contact-section.tsx`, `finance/finance-tools-section.tsx`, `inventory/inventory-section.tsx`, `inventory/filter-select.tsx`, `ui/button.tsx`, `ui/pill-group.tsx`, `ui/container.tsx`.

**Created (MINI theme — Tasks 14–17)** under `components/themes/mini/` and **(Fiat — Tasks 19–22)** under `components/themes/fiat/`: `Home.tsx`, `InventoryList.tsx`, `VehicleDetail.tsx`, `fonts.ts`, plus brand `ui/` and section components as each design needs.

**Modified (one-time only):**
| File | Change | Task |
|---|---|---|
| `lib/db/settings.ts` | `+ brandTheme` on type and `DEFAULT_SETTINGS` | 1 |
| `app/page.tsx` | body → `<HomeThemeRouter />` | 12 |
| `app/inventory/page.tsx` | body → `<InventoryThemeRouter />` | 12 |
| `app/inventory/[id]/page.tsx` | body → `<DetailThemeRouter />` | 12 |
| `app/dashboard/settings/page.tsx` | `+` one Brand Theme `<select>` | 13 |

**Deleted:** `components/inventory/vehicle-card.tsx` (no importers — dead code), and after moves: empty dirs `components/ui/`, `components/finance/`, plus `components/hero-section.tsx`, `components/intro-section.tsx`, `components/contact-section.tsx`, `components/site-header.tsx`, `components/site-footer.tsx`, `components/theme-switcher.tsx`, `components/inventory/inventory-section.tsx`, `components/inventory/filter-select.tsx` (moved into `bmw/`).

**Untouched shared infra:** `components/settings-provider.tsx`, `auth-provider.tsx`, `motion-provider.tsx`, `reveal.tsx`, `showroom-context.tsx`, `AgenteWidget.tsx`, `icons.tsx`, `components/inventory/vehicle-form-modal.tsx`, `components/inventory/photo-guide-diagram.tsx`, `components/image-uploader.tsx`.

---

## Task 1: Theme registry primitives + settings field

**Files:**
- Create: `lib/themes.ts`
- Modify: `lib/db/settings.ts` (type `DealershipSettings` ~line 23-33; `DEFAULT_SETTINGS` ~line 53-64)

**Interfaces:**
- Produces: `BRAND_THEMES: readonly ["bmw","mini","fiat"]`, `type BrandTheme = "bmw"|"mini"|"fiat"`, `DEFAULT_BRAND_THEME: BrandTheme`, `resolveBrandTheme(v: unknown): BrandTheme`. `DealershipSettings.brandTheme: BrandTheme`.

- [ ] **Step 1: Read the Next.js config/module guide**

Read `node_modules/next/dist/docs/01-app` index to confirm plain `.ts` modules under `lib/` need no directive. No code yet.

- [ ] **Step 2: Create `lib/themes.ts`**

```ts
// Brand-theme identifiers for the public front-end. The active brand is
// stored as settings.brandTheme in the settings/general Firestore doc and
// resolved by the theme routers in components/themes/. This module has
// zero dependencies so both client and server code can import it.

export const BRAND_THEMES = ["bmw", "mini", "fiat"] as const;

export type BrandTheme = (typeof BRAND_THEMES)[number];

export const DEFAULT_BRAND_THEME: BrandTheme = "bmw";

// Missing, unknown, or legacy values all fall back to the default so the
// site renders correctly before the settings doc has the field.
export function resolveBrandTheme(value: unknown): BrandTheme {
  return (BRAND_THEMES as readonly string[]).includes(value as string)
    ? (value as BrandTheme)
    : DEFAULT_BRAND_THEME;
}
```

- [ ] **Step 3: Add `brandTheme` to the settings type**

In `lib/db/settings.ts`, add the import at the top of the file:

```ts
import type { BrandTheme } from "@/lib/themes";
```

Add to the `DealershipSettings` type (after `agenteGreeting: string;`):

```ts
  brandTheme: BrandTheme;
```

- [ ] **Step 4: Add `brandTheme` to `DEFAULT_SETTINGS`**

In the `DEFAULT_SETTINGS` object, after `agenteGreeting: "..."`:

```ts
  brandTheme: "bmw",
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS. TypeScript resolves `BrandTheme`; no unused-import or type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/themes.ts lib/db/settings.ts
git commit -m "Add brand-theme primitives and settings.brandTheme field"
```

---

## Task 2: `useInventoryData` hook

**Files:**
- Create: `lib/hooks/use-inventory-data.ts`

**Interfaces:**
- Consumes: `Car`, `CARS_COLLECTION` from `@/lib/db/cars`; `db` from `@/lib/firebase`.
- Produces:
  ```ts
  type InventoryFilter = { search?: string; make?: string; bodyStyle?: string; maxPrice?: number };
  function useInventoryData(): {
    cars: Car[];
    loading: boolean;
    availableMakes: string[];
    availableBodyStyles: string[];
    priceCeiling: number;
    filterCars: (f: InventoryFilter) => Car[];
  }
  ```

- [ ] **Step 1: Read the client-component + hooks guidance**

Read `node_modules/next/dist/docs/01-app/` sections on client components and data fetching. Confirm `"use client"` is required for a hook using `useState`/`useEffect`.

- [ ] **Step 2: Create the hook**

```ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";

export type InventoryFilter = {
  search?: string;
  make?: string;
  bodyStyle?: string;
  maxPrice?: number;
};

function numericPrice(price: unknown): number {
  return parseInt(String(price).replace(/[^0-9]/g, ""), 10);
}

// Single source of truth for the public inventory read + its derived
// filter options. Both the home grid and the /inventory listing consume
// this so the two never drift (they used to duplicate the query and the
// price-ceiling math). Themes call filterCars() and slice/paginate the
// result themselves — pagination and "featured N" are presentation.
export function useInventoryData() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDocs(query(collection(db, CARS_COLLECTION), orderBy("createdAt", "desc")))
      .then((snap) => {
        if (!cancelled) setCars(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Car));
      })
      .catch((err) => console.error("[use-inventory-data] failed to load cars", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const availableMakes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.make).filter(Boolean))).sort(),
    [cars]
  );

  const availableBodyStyles = useMemo(
    () => Array.from(new Set(cars.map((c) => c.bodyStyle).filter(Boolean))).sort(),
    [cars]
  );

  const priceCeiling = useMemo(() => {
    const prices = cars.map((c) => numericPrice(c.price)).filter((p) => Number.isFinite(p) && p > 0);
    return prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 100000;
  }, [cars]);

  const filterCars = useCallback(
    (f: InventoryFilter) => {
      const search = (f.search ?? "").trim().toLowerCase();
      return cars.filter((car) => {
        if (search) {
          const hit =
            car.title?.toLowerCase().includes(search) || car.make?.toLowerCase().includes(search);
          if (!hit) return false;
        }
        if (f.make && car.make !== f.make) return false;
        if (f.bodyStyle && car.bodyStyle !== f.bodyStyle) return false;
        if (typeof f.maxPrice === "number") {
          const p = numericPrice(car.price);
          if (Number.isFinite(p) && p > f.maxPrice) return false;
        }
        return true;
      });
    },
    [cars]
  );

  return { cars, loading, availableMakes, availableBodyStyles, priceCeiling, filterCars };
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/hooks/use-inventory-data.ts
git commit -m "Add useInventoryData shared hook"
```

---

## Task 3: `useCarDetail` hook

**Files:**
- Create: `lib/hooks/use-car-detail.ts`

**Interfaces:**
- Produces: `function useCarDetail(id: string | undefined): { car: Car | null; loading: boolean; notFound: boolean }`

- [ ] **Step 1: Create the hook**

```ts
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";

// Single-car read for the public vehicle-detail surface. Extracted from
// app/inventory/[id]/page.tsx so every theme's detail layout shares it.
export function useCarDetail(id: string | undefined) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getDoc(doc(db, CARS_COLLECTION, id))
      .then((snap) => {
        if (cancelled) return;
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          setCar({ id: snap.id, ...snap.data() } as Car);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("[use-car-detail] failed to load car", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { car, loading, notFound };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/hooks/use-car-detail.ts
git commit -m "Add useCarDetail shared hook"
```

---

## Task 4: `useLeadForm` hook + shared prop types

**Files:**
- Create: `lib/hooks/use-lead-form.ts`
- Create: `components/themes/types.ts`

**Interfaces:**
- Produces (`lib/hooks/use-lead-form.ts`):
  ```ts
  type LeadPayload = {
    name: string; email: string; phone: string;
    preferredContact?: string; vehicleId?: string;
    preferredDate?: string; preferredTime?: string; message?: string;
  };
  function useLeadForm(): {
    submit: (payload: LeadPayload) => Promise<void>;
    submitting: boolean; success: boolean; error: string; reset: () => void;
  }
  ```
- Produces (`components/themes/types.ts`): `HomeProps`, `InventoryListProps`, `VehicleDetailProps`, re-exports `LeadPayload`, `LeadFormApi`.

- [ ] **Step 1: Create `lib/hooks/use-lead-form.ts`**

```ts
"use client";

import { useCallback, useState } from "react";

export type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  preferredContact?: string;
  vehicleId?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
};

// The POST to /api/contact that the homepage contact form and every
// theme's vehicle-detail lead form share. /api/contact normalizes the
// lead into the shape lib/db/leads.ts + the dashboard pipeline expect,
// so themes must go through here rather than writing Firestore directly.
export function useLeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = useCallback(async (payload: LeadPayload) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo enviar la consulta.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la consulta.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSubmitting(false);
    setSuccess(false);
    setError("");
  }, []);

  return { submit, submitting, success, error, reset };
}
```

- [ ] **Step 2: Create `components/themes/types.ts`**

```ts
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/hooks/use-lead-form.ts components/themes/types.ts
git commit -m "Add useLeadForm hook and shared theme prop types"
```

---

## Task 5: `ThemeSkeleton` + `use-theme-attribute`

**Files:**
- Create: `components/themes/ThemeSkeleton.tsx`
- Create: `components/themes/use-theme-attribute.ts`

**Interfaces:**
- Produces: `function ThemeSkeleton({ surface }: { surface: "home" | "list" | "detail" }): JSX.Element`; `function useThemeAttribute(brand: BrandTheme): void`.

- [ ] **Step 1: Create `components/themes/ThemeSkeleton.tsx`**

```tsx
// Neutral, brand-agnostic placeholder shown for the ~1 frame between
// first paint and SettingsProvider resolving settings.brandTheme. Uses
// only the shared globals.css tokens so it looks acceptable under any
// data-theme value.

export function ThemeSkeleton({ surface }: { surface: "home" | "list" | "detail" }) {
  const rows = surface === "detail" ? 1 : surface === "list" ? 9 : 6;
  return (
    <div className="min-h-screen bg-bg px-6 py-24">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="h-10 w-2/3 rounded-none bg-bg-elevated-2" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-56 rounded-none bg-bg-elevated" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/themes/use-theme-attribute.ts`**

```ts
"use client";

import { useEffect } from "react";
import type { BrandTheme } from "@/lib/themes";

// The visitor colour-switcher (light/red/blue/green) is a BMW-only
// feature: it writes localStorage "oxis-theme" and app/layout.tsx's init
// script mirrors that onto <html data-theme>. MINI and Fiat ship their
// own self-contained palettes and must not inherit a stale
// [data-theme="red"] block from globals.css, so strip the attribute for
// any non-BMW brand. BMW leaves it exactly as the init script set it.
export function useThemeAttribute(brand: BrandTheme) {
  useEffect(() => {
    if (brand === "bmw") return;
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.removeAttribute("data-theme");
    return () => {
      if (previous) root.setAttribute("data-theme", previous);
    };
  }, [brand]);
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/themes/ThemeSkeleton.tsx components/themes/use-theme-attribute.ts
git commit -m "Add ThemeSkeleton and useThemeAttribute"
```

---

## Task 6: Registry + placeholder BMW surface stubs

This task stands up the registry pointing at **temporary stub** surfaces so the routers (Task 7) compile and render before the real BMW theme exists (Tasks 8–11). Tasks 9–11 replace the stub bodies.

**Files:**
- Create: `components/themes/bmw/Home.tsx` (stub)
- Create: `components/themes/bmw/InventoryList.tsx` (stub)
- Create: `components/themes/bmw/VehicleDetail.tsx` (stub)
- Create: `components/themes/registry.tsx`

**Interfaces:**
- Consumes: `HomeProps`, `InventoryListProps`, `VehicleDetailProps` from `../types`.
- Produces:
  ```ts
  type ThemeSurfaces = {
    Home: React.ComponentType<HomeProps>;
    InventoryList: React.ComponentType<InventoryListProps>;
    VehicleDetail: React.ComponentType<VehicleDetailProps>;
  };
  const THEMES: Record<BrandTheme, ThemeSurfaces>;
  ```

- [ ] **Step 1: Read the `next/dynamic` guide**

Read `node_modules/next/dist/docs/01-app/` on `next/dynamic` / lazy loading. Note whether `ssr: false` is needed for client-only surfaces (these surfaces are `"use client"` and read browser-only context; if the guide recommends `ssr: false` for such, apply it uniformly in Step 3).

- [ ] **Step 2: Create the three stub surfaces**

`components/themes/bmw/Home.tsx`:
```tsx
"use client";

import type { HomeProps } from "@/components/themes/types";

export default function Home(_props: HomeProps) {
  return <div className="min-h-screen bg-bg p-24 text-fg">BMW Home (stub)</div>;
}
```

`components/themes/bmw/InventoryList.tsx`:
```tsx
"use client";

import type { InventoryListProps } from "@/components/themes/types";

export default function InventoryList(_props: InventoryListProps) {
  return <div className="min-h-screen bg-bg p-24 text-fg">BMW InventoryList (stub)</div>;
}
```

`components/themes/bmw/VehicleDetail.tsx`:
```tsx
"use client";

import type { VehicleDetailProps } from "@/components/themes/types";

export default function VehicleDetail(_props: VehicleDetailProps) {
  return <div className="min-h-screen bg-bg p-24 text-fg">BMW VehicleDetail (stub)</div>;
}
```

- [ ] **Step 3: Create `components/themes/registry.tsx`**

```tsx
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
```

- [ ] **Step 4: Create temporary mini/fiat stubs so the registry compiles**

Create `components/themes/mini/Home.tsx`, `mini/InventoryList.tsx`, `mini/VehicleDetail.tsx`, `fiat/Home.tsx`, `fiat/InventoryList.tsx`, `fiat/VehicleDetail.tsx`, each identical in shape to the BMW stub in Step 2 but with the brand/surface name in the text and importing the matching prop type. These are replaced in Tasks 14–22.

Example `components/themes/mini/Home.tsx`:
```tsx
"use client";

import type { HomeProps } from "@/components/themes/types";

export default function Home(_props: HomeProps) {
  return <div className="min-h-screen bg-white p-24 text-black">MINI Home (stub)</div>;
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS. All six dynamic import paths resolve.

- [ ] **Step 6: Commit**

```bash
git add components/themes/registry.tsx components/themes/bmw components/themes/mini components/themes/fiat
git commit -m "Add theme registry with placeholder surface stubs"
```

---

## Task 7: The three theme routers

**Files:**
- Create: `components/themes/HomeThemeRouter.tsx`
- Create: `components/themes/InventoryThemeRouter.tsx`
- Create: `components/themes/DetailThemeRouter.tsx`

**Interfaces:**
- Consumes: `useSettings` from `@/components/settings-provider`; `resolveBrandTheme` from `@/lib/themes`; `THEMES` from `./registry`; `useInventoryData`, `useCarDetail`, `useLeadForm` hooks; `useThemeAttribute`; `ThemeSkeleton`.
- Produces: default-less named exports `HomeThemeRouter`, `InventoryThemeRouter`, `DetailThemeRouter` — each a zero-prop client component.

- [ ] **Step 1: Create `components/themes/HomeThemeRouter.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `components/themes/InventoryThemeRouter.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `components/themes/DetailThemeRouter.tsx`**

```tsx
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
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/themes/HomeThemeRouter.tsx components/themes/InventoryThemeRouter.tsx components/themes/DetailThemeRouter.tsx
git commit -m "Add Home/Inventory/Detail theme routers"
```

---

## Task 8: Move BMW leaf components into `components/themes/bmw/`

Pure move + import-path rewrite. **No markup or class changes.**

**Files:**
- Move `components/hero-section.tsx` → `components/themes/bmw/hero-section.tsx`
- Move `components/intro-section.tsx` → `components/themes/bmw/intro-section.tsx`
- Move `components/contact-section.tsx` → `components/themes/bmw/contact-section.tsx`
- Move `components/site-header.tsx` → `components/themes/bmw/site-header.tsx`
- Move `components/site-footer.tsx` → `components/themes/bmw/site-footer.tsx`
- Move `components/theme-switcher.tsx` → `components/themes/bmw/theme-switcher.tsx`
- Move `components/finance/finance-tools-section.tsx` → `components/themes/bmw/finance/finance-tools-section.tsx`
- Move `components/inventory/inventory-section.tsx` → `components/themes/bmw/inventory/inventory-section.tsx`
- Move `components/inventory/filter-select.tsx` → `components/themes/bmw/inventory/filter-select.tsx`
- Move `components/ui/button.tsx` → `components/themes/bmw/ui/button.tsx`
- Move `components/ui/pill-group.tsx` → `components/themes/bmw/ui/pill-group.tsx`
- Move `components/ui/container.tsx` → `components/themes/bmw/ui/container.tsx`
- Delete: `components/inventory/vehicle-card.tsx` (verified zero importers in File Structure section)

- [ ] **Step 1: Confirm `vehicle-card.tsx` is still unreferenced**

Run: `grep -rn "vehicle-card" --include="*.tsx" --include="*.ts" app components`
Expected: no matches (or only the file itself). If anything else references it, STOP and move it into `bmw/inventory/` instead of deleting.

- [ ] **Step 2: Move the files**

```bash
mkdir -p components/themes/bmw/ui components/themes/bmw/finance components/themes/bmw/inventory
git mv components/hero-section.tsx components/themes/bmw/hero-section.tsx
git mv components/intro-section.tsx components/themes/bmw/intro-section.tsx
git mv components/contact-section.tsx components/themes/bmw/contact-section.tsx
git mv components/site-header.tsx components/themes/bmw/site-header.tsx
git mv components/site-footer.tsx components/themes/bmw/site-footer.tsx
git mv components/theme-switcher.tsx components/themes/bmw/theme-switcher.tsx
git mv components/finance/finance-tools-section.tsx components/themes/bmw/finance/finance-tools-section.tsx
git mv components/inventory/inventory-section.tsx components/themes/bmw/inventory/inventory-section.tsx
git mv components/inventory/filter-select.tsx components/themes/bmw/inventory/filter-select.tsx
git mv components/ui/button.tsx components/themes/bmw/ui/button.tsx
git mv components/ui/pill-group.tsx components/themes/bmw/ui/pill-group.tsx
git mv components/ui/container.tsx components/themes/bmw/ui/container.tsx
git rm components/inventory/vehicle-card.tsx
```

- [ ] **Step 3: Rewrite imports among the moved files**

In the moved files, update **relative-to-moved-sibling** imports:
- `@/components/ui/button` → `@/components/themes/bmw/ui/button`
- `@/components/ui/pill-group` → `@/components/themes/bmw/ui/pill-group`
- `@/components/ui/container` → `@/components/themes/bmw/ui/container`
- `@/components/inventory/filter-select` → `@/components/themes/bmw/inventory/filter-select`

Leave these **unchanged** (they stay shared infra): `@/components/reveal`, `@/components/showroom-context`, `@/components/settings-provider`, `@/components/icons`, `@/lib/*`.

Run this to find every line needing a change:
```bash
grep -rn "@/components/ui/\|@/components/inventory/filter-select\|@/components/hero-section\|@/components/intro-section\|@/components/contact-section\|@/components/site-header\|@/components/site-footer\|@/components/theme-switcher\|@/components/finance/" --include="*.tsx" components/themes/bmw
```

- [ ] **Step 4: Point the registry stubs' siblings — no-op check**

`app/page.tsx` and the two inventory pages still import from the old `@/components/*` paths and will now fail to build. That is expected; Task 12 fixes them. For this task, verify only that `components/themes/bmw/**` is internally consistent:

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "components/themes/bmw" || echo "bmw tree clean"`
Expected: `bmw tree clean` (errors elsewhere in `app/` are fine at this checkpoint).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Move BMW public components into components/themes/bmw/ (no visual change)"
```

---

## Task 9: BMW `Home.tsx` + `fonts.ts`

Replace the `bmw/Home.tsx` stub with the real composition, lifted from `app/page.tsx` (the current `Home()` body).

**Files:**
- Create: `components/themes/bmw/fonts.ts`
- Modify: `components/themes/bmw/Home.tsx` (replace stub)
- Reference (read only): current `app/page.tsx`

**Interfaces:**
- Consumes: `HomeProps` from `../types`; the moved section components; `ShowroomProvider` from `@/components/showroom-context`.
- Produces: `export default function Home(props: HomeProps)`.

- [ ] **Step 1: Read the `next/font` guide**

Read `node_modules/next/dist/docs/01-app/` on `next/font`. Confirm `next/font/google` may be called at module scope in a non-layout file and that the `.variable` className is what scopes the CSS variable.

- [ ] **Step 2: Create `components/themes/bmw/fonts.ts`**

```ts
// BMW theme keeps the site's original typefaces (Geist / Geist Mono) so
// the moved markup's font-sans / font-mono utilities render exactly as
// before. Re-declared here rather than imported from app/layout.tsx to
// keep every theme's fonts inside its own folder.
import { Geist, Geist_Mono } from "next/font/google";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// app/layout.tsx already sets these variables on <html>, so applying this
// className is belt-and-suspenders — harmless and keeps the theme
// self-describing.
export const bmwFontClass = `${sans.variable} ${mono.variable}`;
```

- [ ] **Step 3: Replace `components/themes/bmw/Home.tsx`**

Take the JSX from the current `app/page.tsx` `Home()` return. The `<SiteHeader/>`, `<HeroSection/>` … composition is unchanged; wrap the outer element so it consumes `HomeProps` and passes the inventory data down. Because the current `InventorySection` / `FinanceToolsSection` fetch their own data today, in this task **keep them fetching their own data** (they still work — `inventory-section.tsx` was moved intact). The prop wiring of those two sections to `useInventoryData` is deliberately **out of scope** here to keep the move zero-risk; they read the same collection. Add a `// TODO(theme-parity)` note is NOT allowed — instead leave them as-is with this comment:

```tsx
"use client";

import { SiteHeader } from "./site-header";
import { HeroSection } from "./hero-section";
import { IntroSection } from "./intro-section";
import { InventorySection } from "./inventory/inventory-section";
import { FinanceToolsSection } from "./finance/finance-tools-section";
import { ContactSection } from "./contact-section";
import { SiteFooter } from "./site-footer";
import { ShowroomProvider } from "@/components/showroom-context";
import type { HomeProps } from "@/components/themes/types";

// BMW home surface. Props from HomeThemeRouter are accepted for contract
// parity; InventorySection and FinanceToolsSection currently read the
// cars collection through their own effects (unchanged in the move), so
// the props are not yet threaded into them. Any future change to that
// wiring stays inside components/themes/bmw/.
export default function Home(_props: HomeProps) {
  return (
    <ShowroomProvider>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <IntroSection />
        <InventorySection />
        <FinanceToolsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </ShowroomProvider>
  );
}
```

- [ ] **Step 4: Verify the bmw tree typechecks**

Run: `npx tsc --noEmit 2>&1 | grep "components/themes/bmw" || echo "bmw tree clean"`
Expected: `bmw tree clean`.

- [ ] **Step 5: Commit**

```bash
git add components/themes/bmw/fonts.ts components/themes/bmw/Home.tsx
git commit -m "Implement BMW Home surface and fonts module"
```

---

## Task 10: BMW `InventoryList.tsx`

Move the body of `app/inventory/page.tsx` into the surface component. It fetches its own data today; convert it to consume `InventoryListProps` so the shared hook is the single reader.

**Files:**
- Modify: `components/themes/bmw/InventoryList.tsx` (replace stub)
- Reference (read only): current `app/inventory/page.tsx`

**Interfaces:**
- Consumes: `InventoryListProps` (`cars, loading, availableMakes, availableBodyStyles, priceCeiling, filterCars`); `useSettings`; `buildWhatsAppLink`.
- Produces: `export default function InventoryList(props: InventoryListProps)`.

- [ ] **Step 1: Copy `app/inventory/page.tsx` into `components/themes/bmw/InventoryList.tsx`**

Rename the function to `InventoryList`, make it the default export, keep `"use client"`.

- [ ] **Step 2: Delete the local data effect; take data from props**

Remove: the `cars` / `loading` `useState`, the `fetchInventory` `useEffect`, the `availableMakes` / `availableBodyStyles` / `priceCeiling` `useMemo`s, and the direct `firebase`/`@/lib/firebase`/`@/lib/db/cars` imports (keep `import type { Car }` only if still referenced).

Change the signature to:
```tsx
export default function InventoryList({
  cars,
  loading,
  availableMakes,
  availableBodyStyles,
  priceCeiling,
  filterCars,
}: InventoryListProps) {
```

- [ ] **Step 3: Route filtering through `filterCars`**

Replace the inline `filteredCars = cars.filter(...)` block with:
```tsx
const filteredCars = filterCars({
  search: searchTerm,
  make: selectedMake === "All" ? undefined : selectedMake,
  bodyStyle: selectedBodyStyle === "All" ? undefined : selectedBodyStyle,
  maxPrice,
});
```
Keep the local `searchTerm` / `selectedMake` / `selectedBodyStyle` / `maxPrice` / `currentPage` state, the `priceCeiling`-seeding `useEffect` (now depending on the `priceCeiling` prop), the pagination math, and **all markup and classes unchanged**.

- [ ] **Step 4: Verify the bmw tree typechecks**

Run: `npx tsc --noEmit 2>&1 | grep "components/themes/bmw/InventoryList" || echo "clean"`
Expected: `clean`.

- [ ] **Step 5: Commit**

```bash
git add components/themes/bmw/InventoryList.tsx
git commit -m "Implement BMW InventoryList surface on the shared hook"
```

---

## Task 11: BMW `VehicleDetail.tsx`

Move the body of `app/inventory/[id]/page.tsx` in; take `car` / `loading` / `notFound` and the lead form from props.

**Files:**
- Modify: `components/themes/bmw/VehicleDetail.tsx` (replace stub)
- Reference (read only): current `app/inventory/[id]/page.tsx`

**Interfaces:**
- Consumes: `VehicleDetailProps` (`car, loading, notFound, leadForm`); `useSettings`; `buildWhatsAppLink`; `estimateListingPayment`.
- Produces: `export default function VehicleDetail(props: VehicleDetailProps)`.

- [ ] **Step 1: Copy the file in**

Rename to `VehicleDetail`, default export, keep `"use client"`. Keep the `Stat` helper and `FALLBACK_IMAGE` / `DEFAULT_FEATURES` consts.

- [ ] **Step 2: Delete local data + form fetch; use props**

Remove: `useParams`, the `useCarDetail`-equivalent `useState`/`useEffect` block (`car`, `loading`, `notFound`), the direct `getDoc`/`firebase` imports, the `handleLeadSubmit` `fetch` call body, and the `submitting`/`success`/`error` `useState`.

Signature:
```tsx
export default function VehicleDetail({ car, loading, notFound, leadForm }: VehicleDetailProps) {
```

Keep local state for the form **fields** (`name`, `email`, `phone`, `message`), `activeImage`, `featuresOpen`.

- [ ] **Step 3: Re-point the message prefill and submit**

The current code prefills `message` from an effect after the car loads. Replace with a derived default + one effect keyed on `car?.id`:
```tsx
useEffect(() => {
  if (car) {
    setMessage(
      `Hola, estoy viendo la nota editorial sobre el ${car.title} (${car.price}). ¿Sigue disponible?`
    );
  }
}, [car]);
```

Replace `handleLeadSubmit` body with:
```tsx
async function handleLeadSubmit(e: FormEvent) {
  e.preventDefault();
  if (!car) return;
  try {
    await leadForm.submit({
      name,
      email,
      phone,
      preferredContact: "WhatsApp",
      vehicleId: car.id,
      message,
    });
  } catch {
    /* leadForm.error is set by the hook */
  }
}
```

Swap references: `submitting` → `leadForm.submitting`, `success` → `leadForm.success`, `error` → `leadForm.error`. **Markup and classes unchanged.**

- [ ] **Step 4: Verify the bmw tree typechecks**

Run: `npx tsc --noEmit 2>&1 | grep "components/themes/bmw/VehicleDetail" || echo "clean"`
Expected: `clean`.

- [ ] **Step 5: Commit**

```bash
git add components/themes/bmw/VehicleDetail.tsx
git commit -m "Implement BMW VehicleDetail surface on shared hooks"
```

---

## Task 12: Flip the `app/` pages to routers + full BMW parity check

**Files:**
- Modify: `app/page.tsx` (full replace)
- Modify: `app/inventory/page.tsx` (full replace)
- Modify: `app/inventory/[id]/page.tsx` (full replace)

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import { HomeThemeRouter } from "@/components/themes/HomeThemeRouter";

export default function Page() {
  return <HomeThemeRouter />;
}
```

- [ ] **Step 2: Replace `app/inventory/page.tsx`**

```tsx
import { InventoryThemeRouter } from "@/components/themes/InventoryThemeRouter";

export default function Page() {
  return <InventoryThemeRouter />;
}
```

- [ ] **Step 3: Replace `app/inventory/[id]/page.tsx`**

```tsx
import { DetailThemeRouter } from "@/components/themes/DetailThemeRouter";

export default function Page() {
  return <DetailThemeRouter />;
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS, all 12 routes generated as before.

- [ ] **Step 5: Manual parity walkthrough**

Run: `npm run dev`. With `settings.brandTheme` absent or `"bmw"`, visit and compare against production (`https://oxis-lac.vercel.app`):
- `/` — header, hero video, intro cards, inventory grid + filters, finance calculator + trade-in, contact form, footer + theme switcher. All identical.
- `/inventory` — sidebar (advanced search, finance calc, trade-in), 3-col grid, pagination, footer. Identical.
- `/inventory/<real id>` — magazine layout, gallery, spec ticker, features ledger, inquiry form + WhatsApp. Submit a test lead; confirm it appears in `/dashboard/leads`.
- Toggle the footer colour switcher (light/red/blue/green) — still works.

Fix any diff by correcting the move (not by restyling). Screenshot `/`, `/inventory`, `/inventory/<id>` into `docs/superpowers/plans/assets/2026-09-05-bmw-*.png` for the record.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/inventory/page.tsx "app/inventory/[id]/page.tsx" docs/superpowers/plans/assets
git commit -m "Route public pages through the theme dispatcher (BMW parity verified)"
```

---

## Task 13: Dashboard "Brand Theme" selector

The single permitted edit to `app/dashboard/`.

**Files:**
- Modify: `app/dashboard/settings/page.tsx` (add one field to the first card, ~line 154-225)

**Interfaces:**
- Consumes: `BRAND_THEMES` from `@/lib/themes`; existing `update()` / `form` / `handleSubmit`.

- [ ] **Step 1: Import the brand list**

Add near the other imports:
```ts
import { BRAND_THEMES } from "@/lib/themes";
```

Add a label map just below `labelClasses`:
```ts
const BRAND_THEME_LABELS: Record<(typeof BRAND_THEMES)[number], string> = {
  bmw: "BMW",
  mini: "MINI",
  fiat: "Fiat",
};
```

- [ ] **Step 2: Add the select to the first settings card**

Inside the `<div className="grid grid-cols-1 gap-6 rounded-2xl ...">` card, as the first `<div>` child (before "Nombre del concesionario"):
```tsx
<div className="sm:col-span-2">
  <label className={labelClasses}>Tema de marca (sitio público)</label>
  <select
    value={form.brandTheme}
    onChange={(e) => update("brandTheme", e.target.value as typeof form.brandTheme)}
    className={inputClasses}
  >
    {BRAND_THEMES.map((t) => (
      <option key={t} value={t}>
        {BRAND_THEME_LABELS[t]}
      </option>
    ))}
  </select>
  <p className="mt-1 text-[11px] text-[#8E8E93]">
    Cambia por completo el diseño de la página pública, el inventario y las fichas.
  </p>
</div>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Manual check**

`npm run dev` → `/dashboard/settings`: the select shows, defaults to BMW, saves without error. Set it to MINI, save, open `/` in another tab → the MINI stub ("MINI Home (stub)") renders and `<html>` has no `data-theme`. Set back to BMW → real site returns. Set to Fiat → Fiat stub.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/settings/page.tsx
git commit -m "Add Brand Theme selector to dashboard settings"
```

---

## Task 14: MINI theme — `fonts.ts` + `ui/` primitives

MINI brand direction: **bold, playful, geometric.** High-contrast black/white with one vivid accent (`#E10057` MINI-style magenta-red, or racing green `#0d5c3f` — choose one and use a CSS-var). Big tight-tracked uppercase display type, generous whitespace, circular/pill motifs (MINI's roundel), thick 2px borders, chunky buttons. This is deliberately **not** the BMW dark editorial look.

**Files:**
- Modify: `components/themes/mini/Home.tsx` etc. stay stubs until later tasks — this task only creates `fonts.ts` and shared primitives.
- Create: `components/themes/mini/fonts.ts`
- Create: `components/themes/mini/ui/mini-shell.tsx` (page shell: header + footer + accent CSS var)
- Create: `components/themes/mini/ui/mini-button.tsx`
- Create: `components/themes/mini/ui/mini-field.tsx` (label + input/select wrapper)

**Interfaces:**
- Produces: `miniFontClass: string`; `<MiniShell>{children}</MiniShell>`; `<MiniButton href?|onClick? variant="solid"|"outline">`; `<MiniField label>{control}</MiniField>`.

- [ ] **Step 1: Create `components/themes/mini/fonts.ts`**

```ts
// MINI theme: a bold geometric grotesque for display + a clean grotesque
// for body. Archivo covers both with a wide axis for headlines.
import { Archivo } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-mini",
  axes: ["wdth"],
});

export const miniFontClass = archivo.variable;
// Usage in components: className="font-[family-name:var(--font-mini)]"
```

- [ ] **Step 2: Create `components/themes/mini/ui/mini-shell.tsx`**

A client component that renders a sticky top bar (dealership name from `useSettings`, links to `#inventory`/`#contact`/`/dashboard`), the `{children}` main, and a footer (address, hours, phone, WhatsApp via `buildWhatsAppLink`). Root `<div>` applies `miniFontClass`, sets `style={{ ["--mini-accent" as string]: "#E10057" }}`, `bg-white text-neutral-950`. Use `@/components/settings-provider`, `@/lib/whatsapp` only. ~120 lines; match the data shown by BMW's `site-header`/`site-footer` but in MINI styling (thick borders, uppercase, roundel accent).

- [ ] **Step 3: Create `mini-button.tsx` and `mini-field.tsx`**

`MiniButton`: `inline-flex items-center gap-2 border-2 border-neutral-950 px-6 py-3 text-sm font-bold uppercase tracking-wide transition-transform active:scale-[0.97]`; `solid` = `bg-[--mini-accent] text-white border-[--mini-accent]`, `outline` = transparent. Render `<Link>` when `href` set (support `external`), else `<button>`.

`MiniField`: `<label>` with uppercase 11px bold label + the passed control; provides a shared `miniControlClass` export: `w-full border-2 border-neutral-950 bg-white px-4 py-3 text-sm outline-none focus:border-[--mini-accent]`.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS (stubs still render; new files compile).

- [ ] **Step 5: Commit**

```bash
git add components/themes/mini/fonts.ts components/themes/mini/ui
git commit -m "MINI theme: fonts and shared UI primitives"
```

---

## Task 15: MINI `Home.tsx`

**Files:**
- Modify: `components/themes/mini/Home.tsx` (replace stub)

**Interfaces:**
- Consumes: `HomeProps`; `MiniShell`, `MiniButton`, `MiniField` + `miniControlClass`; `estimateListingPayment` from `@/lib/finance`; `monthlyPayment`, `estimateTradeInRange` from `@/lib/finance`; `ShowroomProvider`/`useShowroom` optional.

- [ ] **Step 1: Build the MINI home composition**

`export default function Home({ cars, loading, availableMakes, availableBodyStyles, priceCeiling, filterCars }: HomeProps)` wrapped in `<MiniShell>`. Sections, each visually distinct from BMW:
1. **Hero** — full-bleed `bg-neutral-950 text-white`, huge `font-[family-name:var(--font-mini)]` uppercase headline, one `MiniButton` to `#inventory`. Static image via `next/image` using `settings.heroBannerImageUrl` (read `useSettings` inside, allowed).
2. **Guarantees strip** — reuse the four `GUARANTEES` copy from BMW's `intro-section` (copy the array literal into this file; do not import from bmw/), as a 4-up grid of bordered cards with roundel bullets.
3. **Featured inventory** — `filterCars({}).slice(0, 6)` grid of MINI cards (bordered, uppercase make, price, `MiniButton` "Ver"). `loading` → 6 skeleton cards. Link each to `/inventory/${car.id}`.
4. **Finance calculator** — local state (`price`, `downPayment`, `apr`, `term`), `monthlyPayment()` from `@/lib/finance`, MINI-styled result panel.
5. **Contact** — MINI-styled form; on submit call a local `useLeadForm()`… **wait:** `useLeadForm` is available to themes (it's a shared hook, not Firestore). Import `useLeadForm` from `@/lib/hooks/use-lead-form` and use it here. Fields: name/email/phone/message + `preferredContact`.

Keep all copy in Spanish. ~250–320 lines.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Manual check**

`npm run dev`, set `brandTheme:"mini"` in `/dashboard/settings`, open `/`. All five sections render, distinctly MINI, no console errors, finance math updates, contact form submits (check `/dashboard/leads`).

- [ ] **Step 4: Commit**

```bash
git add components/themes/mini/Home.tsx
git commit -m "MINI theme: Home surface"
```

---

## Task 16: MINI `InventoryList.tsx`

**Files:**
- Modify: `components/themes/mini/InventoryList.tsx` (replace stub)

**Interfaces:**
- Consumes: `InventoryListProps`; `MiniShell`, `MiniField` + `miniControlClass`, `MiniButton`.

- [ ] **Step 1: Build the listing**

`export default function InventoryList({ cars, loading, availableMakes, availableBodyStyles, priceCeiling, filterCars }: InventoryListProps)` in `<MiniShell>`. Layout distinct from BMW's left-sidebar: a **horizontal filter bar** across the top (keyword `MiniField`, make `<select>`, body `<select>`, max-price `<input type="range">`), then a 2-col (desktop 3-col) grid of MINI cards, then numbered pagination (12/page). Local state for `search`/`make`/`bodyStyle`/`maxPrice`/`page`; results via `filterCars({...})`. `maxPrice` initial = `priceCeiling` once `cars` load (effect keyed on `cars.length`). Empty state: bordered panel "Ningún MINI coincide con tu búsqueda" + reset `MiniButton`.

- [ ] **Step 2: Verify build**

Run: `npm run build` → PASS.

- [ ] **Step 3: Manual check** — `brandTheme:"mini"` → `/inventory`: filters narrow the grid, pagination works, cards link to detail.

- [ ] **Step 4: Commit**

```bash
git add components/themes/mini/InventoryList.tsx
git commit -m "MINI theme: InventoryList surface"
```

---

## Task 17: MINI `VehicleDetail.tsx`

**Files:**
- Modify: `components/themes/mini/VehicleDetail.tsx` (replace stub)

**Interfaces:**
- Consumes: `VehicleDetailProps` (`car, loading, notFound, leadForm`); `MiniShell`, `MiniButton`, `MiniField` + `miniControlClass`; `estimateListingPayment` from `@/lib/finance`; `buildWhatsAppLink` from `@/lib/whatsapp`; `useSettings`.

- [ ] **Step 1: Build the detail surface**

`export default function VehicleDetail({ car, loading, notFound, leadForm }: VehicleDetailProps)` in `<MiniShell>`.
- `loading` → centered "Cargando…" ; `notFound || !car` → bordered panel + `MiniButton` back to `/inventory`.
- Layout: big image gallery left/top (thumbnail row, `activeImage` local state, `car.images` or `[car.img]`), spec block (`year`, `mileage`, `drivetrain`, `transmission`) as a bordered 2×2, price + `estimateListingPayment` monthly, features grid (`car.features` or a local `DEFAULT_FEATURES` copied literal), then the inquiry form.
- Form: local `name`/`email`/`phone`/`message` state; `message` default from an effect keyed on `car?.id` (same string style as BMW). Submit → `leadForm.submit({ name, email, phone, preferredContact: "WhatsApp", vehicleId: car.id, message })` in a try/catch. Show `leadForm.success` panel / `leadForm.error` text / disable while `leadForm.submitting`. WhatsApp `MiniButton` via `buildWhatsAppLink(settings.whatsappNumber, message)`.

- [ ] **Step 2: Verify build** — `npm run build` → PASS.

- [ ] **Step 3: Manual check** — `brandTheme:"mini"` → `/inventory/<id>`: gallery switches, form submits and lands in `/dashboard/leads`, bad id shows not-found panel.

- [ ] **Step 4: Commit**

```bash
git add components/themes/mini/VehicleDetail.tsx
git commit -m "MINI theme: VehicleDetail surface"
```

---

## Task 18: MINI theme — full walkthrough gate

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 2: Full MINI walkthrough**

`npm run dev`, `brandTheme:"mini"`. Verify all 3 routes end-to-end (home sections, listing filters+pagination, detail gallery+lead). Confirm in DevTools Network that visiting `/` loads a `mini/Home` chunk and **no** `bmw/Home` chunk. Confirm `<html>` has no `data-theme`. Screenshot the 3 routes into `docs/superpowers/plans/assets/2026-09-05-mini-*.png`.

- [ ] **Step 3: Commit (screenshots only, if any)**

```bash
git add docs/superpowers/plans/assets
git commit -m "MINI theme: walkthrough screenshots" --allow-empty
```

---

## Task 19: Fiat theme — `fonts.ts` + `ui/` primitives

Fiat brand direction: **warm, friendly, compact, Italian.** Light warm background (`#FBF7F0` / cream), ink `#1a1a1a`, Fiat-red accent `#9B1B30` (or `#C8102E`). Rounded humanist type, softer rhythm, smaller type scale than MINI, subtle warm shadows, pill buttons **allowed here** (contrast with MINI's hard corners and BMW's squared corners). Denser layouts.

**Files:**
- Create: `components/themes/fiat/fonts.ts`
- Create: `components/themes/fiat/ui/fiat-shell.tsx`
- Create: `components/themes/fiat/ui/fiat-button.tsx`
- Create: `components/themes/fiat/ui/fiat-field.tsx`

**Interfaces:**
- Produces: `fiatFontClass`; `<FiatShell>`; `<FiatButton>`; `<FiatField>` + `fiatControlClass`.

- [ ] **Step 1: Create `components/themes/fiat/fonts.ts`**

```ts
// Fiat theme: a warm rounded humanist. Mulish reads friendly at small
// sizes and has a light display weight for headings.
import { Mulish } from "next/font/google";

const mulish = Mulish({ subsets: ["latin"], variable: "--font-fiat" });

export const fiatFontClass = mulish.variable;
// Usage: className="font-[family-name:var(--font-fiat)]"
```

- [ ] **Step 2: Create `fiat-shell.tsx`**

Client component: cream `bg-[#FBF7F0] text-[#1a1a1a]`, root applies `fiatFontClass` + `style={{ ["--fiat-accent" as string]: "#9B1B30" }}`. Compact top bar (dealership name, links), `{children}`, warm footer (address / hours / phone / WhatsApp). Same data as BMW header/footer, Fiat styling. Read `useSettings`, `@/lib/whatsapp` only.

- [ ] **Step 3: `fiat-button.tsx` / `fiat-field.tsx`**

`FiatButton`: `rounded-full px-5 py-2.5 text-sm font-semibold transition-transform active:scale-[0.97]`; `solid` = `bg-[--fiat-accent] text-white`, `outline` = `border border-[--fiat-accent] text-[--fiat-accent]`. `<Link>`/`<button>` as MINI.
`FiatField` + `fiatControlClass`: `w-full rounded-xl border border-[#1a1a1a]/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[--fiat-accent]`.

- [ ] **Step 4: Verify build** — `npm run build` → PASS.

- [ ] **Step 5: Commit**

```bash
git add components/themes/fiat/fonts.ts components/themes/fiat/ui
git commit -m "Fiat theme: fonts and shared UI primitives"
```

---

## Task 20: Fiat `Home.tsx`

**Files:**
- Modify: `components/themes/fiat/Home.tsx` (replace stub)

**Interfaces:**
- Consumes: `HomeProps`; `FiatShell`, `FiatButton`, `FiatField` + `fiatControlClass`; `useLeadForm` from `@/lib/hooks/use-lead-form`; `monthlyPayment` from `@/lib/finance`; `useSettings`.

- [ ] **Step 1: Build the Fiat home composition** in `<FiatShell>`:
1. **Hero** — cream, compact: medium headline, short paragraph, `FiatButton` to `#inventory`, small inline image (`settings.heroBannerImageUrl`) rounded-2xl.
2. **Trust row** — the four guarantee items (copy the `GUARANTEES` literal in) as a tight 2×2 with small red check bullets.
3. **Featured** — `filterCars({}).slice(0, 6)`, warm rounded cards, "desde $X/mes" via `estimateListingPayment`. `loading` skeletons.
4. **Finance** — compact calculator, `monthlyPayment()`.
5. **Contact** — Fiat form via `useLeadForm()`.

Spanish copy. ~230–300 lines.

- [ ] **Step 2: Verify build** — PASS.
- [ ] **Step 3: Manual check** — `brandTheme:"fiat"` → `/`: all sections, finance updates, form submits to `/dashboard/leads`.
- [ ] **Step 4: Commit**

```bash
git add components/themes/fiat/Home.tsx
git commit -m "Fiat theme: Home surface"
```

---

## Task 21: Fiat `InventoryList.tsx`

**Files:**
- Modify: `components/themes/fiat/InventoryList.tsx` (replace stub)

**Interfaces:**
- Consumes: `InventoryListProps`; `FiatShell`, `FiatField` + `fiatControlClass`, `FiatButton`.

- [ ] **Step 1: Build** in `<FiatShell>` — a **compact left rail** filter (narrower than BMW's, warm cards) + a denser 3-col grid + "load more" button instead of numbered pages (distinct from BMW pagination and MINI numbered pages). Local `search`/`make`/`bodyStyle`/`maxPrice`/`visibleCount` (start 9, +9 per click); results from `filterCars({...})`. `maxPrice` seeds to `priceCeiling` on load. Empty + reset state.

- [ ] **Step 2: Verify build** — PASS.
- [ ] **Step 3: Manual check** — `brandTheme:"fiat"` → `/inventory`: filters + load-more work, cards link out.
- [ ] **Step 4: Commit**

```bash
git add components/themes/fiat/InventoryList.tsx
git commit -m "Fiat theme: InventoryList surface"
```

---

## Task 22: Fiat `VehicleDetail.tsx`

**Files:**
- Modify: `components/themes/fiat/VehicleDetail.tsx` (replace stub)

**Interfaces:**
- Consumes: `VehicleDetailProps`; `FiatShell`, `FiatButton`, `FiatField` + `fiatControlClass`; `estimateListingPayment`, `buildWhatsAppLink`, `useSettings`.

- [ ] **Step 1: Build** in `<FiatShell>` — compact single-column: image gallery (rounded-2xl, thumb row, `activeImage`), inline spec chips row, short description, features as small pills, then a friendly inquiry card. Form: local fields, `message` default effect keyed on `car?.id`, submit → `leadForm.submit({... preferredContact: "WhatsApp", vehicleId: car.id ...})`, success/error/submitting from `leadForm`, WhatsApp `FiatButton`. `loading` / `notFound` states as MINI.

- [ ] **Step 2: Verify build** — PASS.
- [ ] **Step 3: Manual check** — `brandTheme:"fiat"` → `/inventory/<id>`: gallery, lead submit → `/dashboard/leads`, bad id → not-found.
- [ ] **Step 4: Commit**

```bash
git add components/themes/fiat/VehicleDetail.tsx
git commit -m "Fiat theme: VehicleDetail surface"
```

---

## Task 23: Final integration gate + deploy

**Files:** none (verification + deploy only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: PASS, 12 routes, no type/lint errors.

- [ ] **Step 2: Matrix walkthrough**

`npm run dev`. For each `brandTheme` in `bmw`, `mini`, `fiat` (set via `/dashboard/settings`), walk `/`, `/inventory`, `/inventory/<id>`:
- renders correctly, distinct brand identity, Spanish copy, no console errors;
- inventory filters + result-count + pagination/load-more correct;
- a submitted lead appears in `/dashboard/leads` with the right `vehicleId`;
- DevTools Network: only the active brand's surface chunk loads;
- `<html data-theme>` present only for `bmw`; BMW footer colour switcher still works.

- [ ] **Step 3: Confirm change-boundary invariant**

Run: `git diff --stat 6cc36eb..HEAD -- app/dashboard app/api lib/firebase.ts lib/db`
Expected: only `lib/db/settings.ts` (Task 1) and `app/dashboard/settings/page.tsx` (Task 13) appear. Nothing under `app/api/` or `lib/firebase*`.

- [ ] **Step 4: Push + deploy**

```bash
git push origin build-oxis-auto-site
vercel --prod --yes
```
Confirm the deployment reaches `READY`, then walk the 3 brands on the production URL.

- [ ] **Step 5: Commit any screenshot assets**

```bash
git add docs/superpowers/plans/assets
git commit -m "Multi-theme architecture: final walkthrough screenshots" --allow-empty
git push origin build-oxis-auto-site
```

---

## Self-Review

**Spec coverage:**
- Spec §2 D1 (shared hooks) → Tasks 2–4. D2 (one-time setup) → Tasks 1, 12, 13. D3 (full parity) → Tasks 14–22. D4 (BMW preserved) → Tasks 8–12 (move-only, parity gate Task 12 Step 5). D5 (client dispatcher) → Task 7. D6 (colour switcher BMW-only) → Tasks 5 (`use-theme-attribute`), 8 (`theme-switcher` moved into `bmw/`). D7 (static registry) → Task 6.
- Spec §3 folder structure → File Structure section + Tasks 6, 8. Shared-infra list → File Structure "Untouched".
- Spec §4 theme contract → Task 4 (`types.ts`), enforced by Tasks 9–11, 15–17, 20–22.
- Spec §5 hooks (exact signatures/logic) → Tasks 2, 3, 4.
- Spec §6 dispatcher (`lib/themes.ts`, registry, routers, fallback, `useThemeAttribute`) → Tasks 1, 5, 6, 7.
- Spec §7 settings + dashboard selector → Tasks 1, 13.
- Spec §8 per-theme fonts → Tasks 9 (bmw), 14 (mini), 19 (fiat); no `globals.css` edit anywhere in the plan.
- Spec §9 change boundaries → Global Constraints + Task 23 Step 3 invariant check.
- Spec §10 build sequence → task ordering mirrors the 10 spec steps.
- Spec §11 risks → mitigations: BMW regression (Task 12 Step 5 parity gate + move-only rule), `next/dynamic` (Task 6 Step 1 doc read + Task 6 Step 5 build), stale `data-theme` (Task 5), skeleton flash (Task 5 `ThemeSkeleton`).
- Spec §12 out of scope → nothing in the plan themes `AgenteWidget`, `/login`, or the dashboard beyond the selector; no test framework added; no SSR path.

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N". Task 9 Step 3 explicitly forbids a `TODO` and gives the exact comment text instead. MINI/Fiat surface tasks (15–17, 20–22) give explicit prop signatures, exact hook imports, section-by-section content, and per-step verification; the visual JSX is described at component granularity with concrete class strings for primitives (Tasks 14, 19) — appropriate for net-new brand design, not a placeholder.

**Type consistency:** `HomeProps`/`InventoryListProps`/`VehicleDetailProps`/`LeadPayload`/`LeadFormApi` defined once in Task 4, consumed with identical names in Tasks 6, 7, 9–11, 15–17, 20–22. `useInventoryData` return shape (Task 2) matches `HomeProps` (Task 4) field-for-field. `resolveBrandTheme` (Task 1) used in all three routers (Task 7). `THEMES` (Task 6) keyed by `BrandTheme` (Task 1). Router→surface prop spread (`{...data}`, `{...detail} leadForm={leadForm}`) matches each surface's destructure.

**Gaps found & fixed:** none outstanding. Note carried into execution: Task 9 keeps BMW's `InventorySection`/`FinanceToolsSection` self-fetching (they were moved intact); this is an accepted, documented divergence from "all data via hooks" for the BMW theme only, justified by the move-only zero-risk rule (Spec §2 D4). MINI/Fiat use the hooks fully.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-05-multi-theme-architecture.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
