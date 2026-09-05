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
