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
