## Commands

- `bun install` — install deps. Bun is the package manager **and** the test runner; there is no npm/pnpm lockfile.
- `bun dev` — Vite dev server on port 3000 (with full local Netlify-platform emulation via the Netlify plugin).
- `bun run build` — production build: static client → `dist/client`, SSR handler → a Netlify function.
- `bun run lint` — ESLint (flat config, typescript-eslint).
- `bunx tsc --noEmit` — typecheck. Not wired to a script; run it directly.
- `bun run test:run` — run the unit suite once; `bun run test` watches. Both pin `TZ=UTC` and scope to `src`.
- Single file / test: `TZ=UTC bun test src/lib/schedule.test.ts`, optionally with `-t "<name pattern>"`.

Tests use `bun:test` (Jest-compatible), **not** Vitest — the README is out of date on this.

## Architecture

**Local-first PWA, no backend of its own.** The browser calls three public APIs directly (all CORS-open); there is no application server holding data:

- `forecast.solar` — solar production forecast
- `api.awattar.de` — German day-ahead electricity prices
- `api.brightsky.dev` — DWD cloud cover (drives the weather visuals)

TanStack Start's SSR function only renders a shell that immediately hydrates; all real work runs in the browser.

**Data layer (`src/lib/queries.ts`).** `queryOptions` factories per API, consumed via `useScheduling` (`src/lib/use-scheduling.ts`). Responses are cached in TanStack Query and persisted to `localStorage` (`wattlyzer_query_cache`, `maxAge`/`staleTime` = `DATA_STALE_TIME_MS` = 1h). Query keys round coordinates (`roundCoordinate`, 2dp ≈ 1km) so GPS jitter doesn't bust the cache.

**Client state (`src/lib/settings.ts`).** Two `useSyncExternalStore` stores from a shared `createStore` factory: `settings` (`wattlyzer_settings`) and `prefs` (`wattlyzer_prefs`, holds the `onboarded` flag). `bestSlotMode` and the legacy `ignoreSolarForBestSlot` flag are kept in sync both directions inside the store's `transform`; `loadSavedSettings` migrates older shapes (e.g. `betaCalculations` → `morningShading`). Settings sync across tabs via a `storage` listener; prefs do not.

**Domain logic (`src/lib/schedule.ts`) — the heart of the app.** `calculateSchedule` enumerates hourly start slots on a **UTC grid** (`ceilToUtcHour`) within the search window and scores each by average solar production and/or market price, depending on `settings.bestSlotMode`:

- `combined` (default): prefer a slot clearing the solar minimum (`minKwh`); fall back to cheapest.
- `solar-only`: ignore prices; pick the sunniest qualifying slot.
- `price-only`: ignore solar; pick the cheapest slot.

`calculatePowerGeneration` interpolates cumulative-Wh samples from forecast.solar, applies the fixed `0.7` production factor, then halves output inside morning/evening shading windows. `src/lib/weather.ts` maps real cloud cover to a `WeatherKind`, falling back to a solar-peak heuristic (`forecastWeather`) when weather data is missing.

**UI — the "Sky" design system (`src/components/sky/`).** Inline styles only, no CSS framework (intentional — do not introduce one). `skyTheme(hour)` (`src/lib/sky-theme.ts`) returns the full palette for a local hour; the home gradient, sun/moon arc, and text colors all derive from it. Fraunces is the display font.

**Routing (`src/routes/`).** File-based routes; `src/routeTree.gen.ts` is **generated** — never hand-edit it (the dev server/build regenerates it). `src/router.tsx` builds the router + QueryClient; `src/routes/__root.tsx` wraps the app in `PersistQueryClientProvider` and mounts the unified TanStack devtools lazily, gated behind `import.meta.env.DEV` so they tree-shake out of production.

## Critical conventions

- **Hydration safety + "Dark mode" live in `useSkyHour` (`src/lib/use-sky-hour.ts`).** Every page derives its sky-palette hour through this hook. It returns a fixed hour (`11`) during SSR and the first client render — switching to the live hour only after `mounted` flips — because React never patches hydration attribute mismatches (a live clock in render would freeze the background on the server's palette). The hook also implements the `currentTimeSky` setting ("Dark mode" in the UI): when on, the palette follows the current local hour instead of the page's preferred hour (e.g. the home page's recommended slot). Onboarding steps 0–1 force it on as a preview via `useSkyHour(hour, true)`, independent of the stored setting. Pure decision logic is `pickSkyHour` (unit-tested in `use-sky-hour.test.ts`) — preserve this structure.
- **The React Compiler is enabled** (`babel-plugin-react-compiler` in `vite.config.ts`). Keep component/hook bodies pure so it can memoize. In particular, never call `new Date()` in a render body — use the `useNow()` hook (`src/lib/use-now.ts`), which holds the time in state and ticks every minute.
- **Tests run under `TZ=UTC`**, so local time equals UTC in assertions. The scheduler intentionally mixes frames: the slot grid is UTC (`ceilToUtcHour`, aligning with hourly API keys and `[start,end)` price rows) while shading compares the user's **local** wall-clock hour (`getHours()`), matching the "until 10:00" labels in the UI.

## Deployment (Netlify)

Per Netlify's official TanStack Start guide: the `@netlify/vite-plugin-tanstack-start` plugin (in `vite.config.ts`, ordered `tanstackStart()` → `netlify()` → `viteReact()`) plus `netlify.toml` (`command = "vite build"`, `publish = "dist/client"`). The build emits a serverless function (`.netlify/v1/functions/server.mjs`) for SSR. Netlify CLI ≥ 17.31 is required for `netlify deploy`.

### AGENTS.md

Update this AGENTS.md together with major architectural changes etc.
