@AGENTS.md

# Architectural Guardrails & Theme Isolation Rules

## Strict Theme Boundaries
- **Never mix themes:** Code changes, UI components, Tailwind utility overrides, and state logic for a specific theme must live exclusively inside its designated directory (`components/themes/[theme-name]/`).
- **No Cross-Imports:** A component inside `components/themes/carmax/` must never import from `components/themes/bmw/` or any other brand folder.
- **No Conditional Theme Logic:** Do not use runtime checks like `if (theme === '...')` inside components to alter layouts. If a skin requires a different layout, build it independently inside that skin's folder.
- **Protected Cores:** Never modify files in `app/dashboard/`, global API routes, or shared Firestore services when working on front-end themes unless explicitly instructed for a core database task.
