// Neutral, brand-agnostic placeholder shown for the ~1 frame between
// first paint and SettingsProvider resolving settings.brandTheme. The
// skeleton has no way to know whether a light or dark theme is coming
// (the 6 non-BMW themes strip data-theme), so it uses hardcoded neutral
// grays that read acceptably on both a light and a dark page rather than
// the bg-bg* tokens, which resolve dark from globals.css bare :root.

export function ThemeSkeleton({ surface }: { surface: "home" | "list" | "detail" }) {
  const rows = surface === "detail" ? 1 : surface === "list" ? 9 : 6;
  return (
    <div className="min-h-screen bg-neutral-100 px-6 py-24">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="h-10 w-2/3 rounded-none bg-neutral-300" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-56 rounded-none bg-neutral-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
