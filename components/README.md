# components/

Reusable React components organized by scope.

## Structure
- `ui/` — design-system primitives (`button`, `input`, `select`, `checkbox`, `card`, `icons`).
  These know nothing about the domain and take no data from `lib/`.
- `common/` — shared, cross-feature pieces (`Logo`, `AuthGate`, `AmbientBackdrop`).
- `auth/` — sign-in / access flows.
- `dashboard/` — the app shell (`AppShell`, `Sidebar`, `Topbar`) and dashboard widgets.
- Add one folder per feature as it lands (`patients/`, `embryo-tracking/`, …).

## Conventions
- Server component by default; add `"use client"` only where state, effects or
  event handlers are actually needed.
- Icons are hand-rolled SVGs in `ui/icons.tsx` — no icon package dependency.
- Colour, spacing and radii come from the tokens in `app/globals.css`. Don't
  hard-code hex values in components.
