# Multi-Theme Architecture for the Public Front-End

**Date:** 2026-09-05
**Status:** Approved (design sections 1–4 approved interactively)
**Scope:** Public pages only — home (`/`), inventory listing (`/inventory`), vehicle detail (`/inventory/[id]`)

---

## 1. Goal

Let the dashboard select an active **brand theme** (BMW, MINI, Fiat) that swaps the
entire visual system — layout, typography, spacing, components — of the three public
pages, while the Firestore data, dashboard, API routes, and every other brand theme
stay untouched.

Adding a fourth brand later must be: create one folder, add one registry line, add one
`<option>`. Nothing else.

---

## 2. Decisions (from brainstorming)

| # | Decision |
|---|---|
| D1 | **Shared data via hooks (Approach A).** `useInventoryData`, `useCarDetail`, `useLeadForm` live in shared code, built once, frozen. Themes are presentation-only and never touch Firestore or `/api`. |
| D2 | **One-time foundational setup is allowed to edit shared files** (the 3 route files, `lib/db/settings.ts`, `app/dashboard/settings/page.tsx` once for the selector, new shared hooks/registry/routers). After setup, the isolation rule is permanent. |
| D3 | **Full parity for all 3 brands** — every surface and sub-component built out per brand (distinct header, footer, hero, cards, forms, typography, spacing). |
| D4 | **`bmw` theme preserves today's site exactly.** Literal move of the current home/inventory/detail markup. Zero visual change to what is live. The current internal inconsistency (dark home, light inventory/detail) is kept as-is. |
| D5 | **Client-side dispatcher.** Every public page is already `"use client"` and reads `settings` from `SettingsProvider` (`onSnapshot`). Router is a client component; brief neutral skeleton while settings load. No `firebase-admin` / SSR path. |
| D6 | **The visitor color-switcher (light/red/blue/green)** — `theme-switcher.tsx` + the `[data-theme=…]` blocks in `globals.css` — becomes **BMW-only**. It moves into `components/themes/bmw/` and keeps using the untouched `globals.css` token blocks. MINI/Fiat do not have it. |
| D7 | **Theme resolution via a static typed registry (Approach 1)** with `next/dynamic` per surface for code-splitting. |

---

## 3. Folder structure

```
components/themes/
  types.ts                  SHARED  HomeProps, InventoryListProps, VehicleDetailProps (the prop contracts)
  registry.tsx              SHARED  brand -> { Home, InventoryList, VehicleDetail } via next/dynamic
  HomeThemeRouter.tsx       SHARED  reads settings.brandTheme, calls useInventoryData, renders active Home
  InventoryThemeRouter.tsx  SHARED
  DetailThemeRouter.tsx     SHARED  reads useParams id, calls useCarDetail
  ThemeSkeleton.tsx         SHARED  neutral placeholder while settings load
  use-theme-attribute.ts    SHARED  strips <html data-theme> when brand !== "bmw"

  bmw/                       today's site, moved verbatim
    Home.tsx  InventoryList.tsx  VehicleDetail.tsx
    fonts.ts
    site-header.tsx  site-footer.tsx  theme-switcher.tsx
    hero-section.tsx  intro-section.tsx  contact-section.tsx
    finance/finance-tools-section.tsx
    inventory/inventory-section.tsx  inventory/vehicle-card.tsx  inventory/filter-select.tsx
    ui/button.tsx  ui/pill-group.tsx  ui/container.tsx

  mini/                      new, full parity
    Home.tsx  InventoryList.tsx  VehicleDetail.tsx  fonts.ts
    ui/… + brand components

  fiat/                      new, full parity — same shape as mini/

lib/
  themes.ts                 SHARED  BRAND_THEMES, BrandTheme, DEFAULT_BRAND_THEME, resolveBrandTheme()
  hooks/
    use-inventory-data.ts   SHARED
    use-car-detail.ts       SHARED
    use-lead-form.ts        SHARED
```

### Stays shared infra (NOT moved into `bmw/`)

`components/settings-provider.tsx`, `auth-provider.tsx`, `motion-provider.tsx`,
`reveal.tsx`, `showroom-context.tsx`, `AgenteWidget.tsx`, `icons.tsx`, and everything
under `components/inventory/` that the **dashboard** consumes
(`vehicle-form-modal.tsx`, `photo-guide-diagram.tsx`, `image-uploader.tsx`).

`AgenteWidget` stays global in `app/layout.tsx`, unstyled by themes (out of scope).

---

## 4. Theme contract

Every `components/themes/<brand>/` exports exactly three surface components. Props are
supplied by the shared hooks; local UI state stays theme-side.

| Component | Props (from shared hooks) | Theme owns (local state) |
|---|---|---|
| `Home` | `cars, loading, availableMakes, availableBodyStyles, priceCeiling` | hero, section composition, showroom-selection UI, finance calculator state, "featured 6" slice |
| `InventoryList` | `cars, loading, availableMakes, availableBodyStyles, priceCeiling, filterCars()` | search/filter controls, pagination, grid layout, sidebar tools |
| `VehicleDetail` | `car, loading, notFound, leadForm { submit, submitting, success, error, reset }` | gallery, spec layout, editorial copy, form markup |

**Hard rule:** a theme file may not import `firebase`, `@/lib/firebase`, `@/lib/db/*`,
or call `/api/*`. It may import read-only shared utils: `lib/finance.ts`,
`lib/vehicles.ts`, `lib/whatsapp.ts`, `components/icons.tsx`.

---

## 5. Shared hooks (`lib/hooks/`)

### `use-inventory-data.ts`
Extracted from the duplicated logic in `app/inventory/page.tsx` and
`components/inventory/inventory-section.tsx`.

```ts
useInventoryData(): {
  cars: Car[];
  loading: boolean;
  availableMakes: string[];
  availableBodyStyles: string[];
  priceCeiling: number;                 // ceil(max price / 10000) * 10000, or 100000
  filterCars(c: {
    search?: string; make?: string; bodyStyle?: string; maxPrice?: number;
  }): Car[];
}
```

- One `getDocs(query(collection(db, CARS_COLLECTION), orderBy("createdAt", "desc")))` on mount, `cancelled` guard.
- `filterCars` is the shared predicate: title/make substring search, exact make, exact bodyStyle, parsed numeric price `<= maxPrice` (non-numeric price always passes).
- Pagination, "featured 6" slice, and the homepage `HOMEPAGE_DISPLAY_LIMIT` stay theme-side.

### `use-car-detail.ts`
Extracted from `app/inventory/[id]/page.tsx`.

```ts
useCarDetail(id: string | undefined): {
  car: Car | null;
  loading: boolean;
  notFound: boolean;
}
```

`getDoc(doc(db, CARS_COLLECTION, id))`, `cancelled` guard, `notFound` when `!snap.exists()`.

### `use-lead-form.ts`
The `/api/contact` POST that both the detail page and the homepage contact section perform.

```ts
type LeadPayload = {
  name: string; email: string; phone: string;
  preferredContact?: string;
  vehicleId?: string;
  preferredDate?: string; preferredTime?: string;
  message?: string;
};

useLeadForm(): {
  submit(payload: LeadPayload): Promise<void>;
  submitting: boolean;
  success: boolean;
  error: string;
  reset(): void;
}
```

- POSTs JSON to `/api/contact`; throws on `!res.ok` / `!data.ok`.
- Themes keep their own field-level validation and their own form markup.

---

## 6. Dispatcher

`lib/themes.ts`:

```ts
export const BRAND_THEMES = ["bmw", "mini", "fiat"] as const;
export type BrandTheme = (typeof BRAND_THEMES)[number];
export const DEFAULT_BRAND_THEME: BrandTheme = "bmw";
export function resolveBrandTheme(v: unknown): BrandTheme {
  return (BRAND_THEMES as readonly string[]).includes(v as string)
    ? (v as BrandTheme)
    : DEFAULT_BRAND_THEME;
}
```

`components/themes/registry.tsx`:

```tsx
import dynamic from "next/dynamic";
import type { BrandTheme } from "@/lib/themes";

type ThemeSurfaces = {
  Home: React.ComponentType<HomeProps>;
  InventoryList: React.ComponentType<InventoryListProps>;
  VehicleDetail: React.ComponentType<VehicleDetailProps>;
};

export const THEMES: Record<BrandTheme, ThemeSurfaces> = {
  bmw: {
    Home: dynamic(() => import("./bmw/Home")),
    InventoryList: dynamic(() => import("./bmw/InventoryList")),
    VehicleDetail: dynamic(() => import("./bmw/VehicleDetail")),
  },
  mini: { /* ./mini/* */ },
  fiat: { /* ./fiat/* */ },
};
```

Routers (all client components):

```tsx
export function InventoryThemeRouter() {
  const { settings, loading: settingsLoading } = useSettings();
  const data = useInventoryData();                    // unconditional
  const brand = resolveBrandTheme(settings.brandTheme);
  useThemeAttribute(brand);
  if (settingsLoading) return <ThemeSkeleton surface="list" />;
  const { InventoryList } = THEMES[brand];
  return <InventoryList {...data} />;
}
```

- `resolveBrandTheme` → missing / unknown / legacy value falls back to `"bmw"`, so nothing breaks before the settings doc has the field.
- `useThemeAttribute(brand)`: keeps `<html data-theme>` behavior for BMW; removes the attribute for MINI/Fiat so their self-contained palettes never inherit a stale `[data-theme="red"]` from `globals.css`.
- `next/dynamic` per surface ⇒ a visitor downloads only the active brand's JS.

`app/` pages collapse to one line each:

```tsx
// app/page.tsx
import { HomeThemeRouter } from "@/components/themes/HomeThemeRouter";
export default function Page() { return <HomeThemeRouter />; }
```

```tsx
// app/inventory/page.tsx        -> <InventoryThemeRouter />
// app/inventory/[id]/page.tsx   -> <DetailThemeRouter />   (id read via useParams in the router)
```

---

## 7. Settings & dashboard

`lib/db/settings.ts`:
- `DealershipSettings` gains `brandTheme: BrandTheme` (import type from `lib/themes.ts`).
- `DEFAULT_SETTINGS` gains `brandTheme: "bmw"`.

`app/dashboard/settings/page.tsx` — the **single** one-time dashboard edit:
- One `<select>` added to the existing first settings card, options **BMW / MINI / Fiat**.
- Wired to the existing `update("brandTheme", value)` and persisted by the existing
  `handleSubmit` → `setDoc(..., { merge: true })`. No change to save logic, no other
  dashboard file touched.

After this edit, the isolation rule forbids touching `app/dashboard/**` for any theme work.

---

## 8. Fonts — isolated per theme, network-lazy

- `components/themes/<brand>/fonts.ts` calls `next/font/google` (or `next/font/local`)
  at module scope and exports a variable className.
- Theme surface roots apply that className; font files are fetched by the browser only
  when a surface using them actually renders.
- **BMW** `fonts.ts` re-exposes **Geist / Geist Mono** (its current fonts) so the moved
  markup's `font-sans` / `font-mono` utilities keep working with zero edits.
- **MINI** — bold geometric grotesque. Proposed substitute: **Archivo** (+ Archivo
  Expanded for display) and a mono. MINI components use explicit
  `font-[family-name:var(--font-mini)]` utilities.
- **FIAT** — warm rounded humanist. Proposed substitute: **Mulish** or **Sora**. Same
  explicit-utility pattern.
- **No per-theme entry in `globals.css`.** Custom keyframes/effects a theme needs go in
  a CSS module inside that theme's own folder.
- `app/layout.tsx` keeps loading Geist globally as the baseline for the dashboard and
  the shared skeleton. (`app/layout.tsx` is otherwise frozen.)

Font substitutes are a design detail and may be adjusted during implementation without
re-approval, as long as the change stays inside a theme folder.

---

## 9. Change boundaries (enforceable)

| FROZEN after setup — never edited for theme work | FREE to edit per theme |
|---|---|
| `app/dashboard/**`, `app/api/**` | `components/themes/<brand>/**` only |
| `lib/firebase*`, `lib/db/**` | |
| `app/layout.tsx`, `app/globals.css` | |
| `lib/hooks/**`, `lib/themes.ts` | |
| `components/themes/registry.tsx`, `components/themes/types.ts`, `components/themes/*Router.tsx`, `ThemeSkeleton.tsx`, `use-theme-attribute.ts` | |
| another brand's `components/themes/<other>/**` | |

**Adding a brand later** = new folder + one line in `registry.tsx` + one `<option>` in
the dashboard select. That registry/option edit is the only permitted shared touch, and
only for *adding* a brand — never for styling one.

---

## 10. Build sequence

No test runner exists in this repo (`package.json` has no test script/deps). Verification
per step = `npm run build` (Turbopack typecheck + ESLint, same as the deploy pipeline)
**plus** a manual browser walkthrough. Adding a test framework is out of scope.

1. **Scaffold shared core** — `lib/themes.ts`; add `brandTheme` to settings type + default. Build.
2. **Extract hooks** — create the 3 `lib/hooks/*`; current pages consume them in place to prove parity. Build + click through home/inventory/detail — behavior must be identical.
3. **Registry + routers + skeleton** — `registry.tsx`, 3 `*Router.tsx`, `ThemeSkeleton`, `use-theme-attribute.ts`.
4. **BMW theme** — move `hero/intro/contact/finance/inventory/site-header/site-footer/theme-switcher/ui` + the 3 surface files into `components/themes/bmw/`; fix imports; `bmw/fonts.ts` re-exposes Geist. Point `registry.tsx` at them.
5. **Flip the `app/` pages** to the 3 one-line routers. Build. **Full walkthrough — the live site must look unchanged.** Screenshot home/inventory/detail for the record.
6. **Dashboard selector** — add the `<select>`. Verify saving flips the rendered theme; fallback still `bmw`.
7. **MINI theme** — full parity: all 3 surfaces + own `ui/` + `fonts.ts`. Build + walkthrough at `brandTheme:"mini"`.
8. **FIAT theme** — same.
9. **Final pass** — `npm run build`; walk all 3 brands × 3 routes; confirm only the active brand's bundle loads (Network tab); confirm `data-theme` stripped for MINI/Fiat.
10. Commit, push, deploy per the usual flow.

**Implementation note:** per `AGENTS.md`, before writing code read the relevant guides
under `node_modules/next/dist/docs/01-app/` (client components, `next/dynamic`,
`next/font`) — this Next.js build has breaking changes vs. training data.

---

## 11. Risk register

| Risk | Mitigation |
|---|---|
| Regression on the live BMW site during the move | Step 5 is a pure file move + import fixups + screenshot diff, no restyle. Build gate before flipping pages. |
| MINI/Fiat full-parity scope is large (2× full theme builds) | Steps 7–8 are the bulk; each surface is build-verified independently; hooks/contract already proven by step 6. |
| `next/dynamic` + client-hook interaction quirks in this Next.js build | Validated in step 3 before any theme depends on it; consult `node_modules/next/dist/docs`. |
| Stale visitor `data-theme` bleeding into MINI/Fiat | `use-theme-attribute.ts` strips the attribute for non-BMW brands; MINI/Fiat palettes are self-contained (no reliance on `--bg`/`--fg` tokens). |
| `SettingsProvider` `loading` flash | Neutral `ThemeSkeleton` per surface; same perceived behavior as today's "Cargando…" states. |

---

## 12. Out of scope

- Theming `AgenteWidget`, the dashboard, or `/login`.
- Unifying the BMW theme's internal dark/light inconsistency (D4).
- Adding a test framework.
- SSR / `firebase-admin` rendering of the theme.
- Per-visitor theme override (theme is a single global dashboard setting).
