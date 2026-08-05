## Commands

- `bun install` — install all workspace dependencies from the single root `bun.lock`.
- `bun dev` / `bun run dev:pwa` — PWA dev server on port 3000 with Netlify emulation.
- `bun run dev:website` — Astro marketing site on port 4321.
- `bun run build` — build every project through Nx.
- `bun run lint`, `bun run typecheck`, `bun run test` — run the target across projects that define it.
- `bun run check` — lint, typecheck, test, and build every project.
- `bun run affected` — run those checks only for Git-affected projects.
- Single project: `bunx nx test core`, `bunx nx build pwa`, or `bunx nx build website`.
- Single test: `TZ=UTC bun test packages/core/src/schedule.test.ts`, optionally with `-t "<name pattern>"`.

Bun is the package manager and test runner; tests use `bun:test`, not Vitest. Keep Nx, `@nx/devkit`, and `@nx/eslint-plugin` on matching versions.

## Workspace architecture

This is a package-based Bun/Nx monorepo:

- `apps/pwa` — TanStack Start + React 19 PWA, deployed to `pwa.wattlyzer.de`.
- `apps/website` — static Astro marketing site, deployed to `wattlyzer.de`.
- `packages/core` — framework-independent scheduling, market coverage, weather decisions, and shared data contracts.
- `packages/api-client` — framework-independent clients for forecast.solar, aWATTar, and BrightSky. It accepts an injected fetch implementation.
- `packages/theme` — framework-independent sky palette and brand tokens shared by both apps.

Workspace packages are private source packages imported through their `@wattlyzer/*` public entrypoints and declared with `workspace:*`. Do not import another project's internal files. Nx tags and ESLint enforce the intended graph: apps may consume shared packages, `api-client` may consume `core`, and platform-agnostic packages must not depend on apps, React, browser storage, DOM APIs, or UI frameworks.

For a future Expo app, add `apps/mobile` and reuse `core`, `api-client`, and `theme`. Keep geolocation, persistence, Query integration, and UI behind platform-specific adapters. Do not attempt to share React DOM/Astro UI components with React Native.

## PWA architecture

**Local-first, no application backend.** The browser calls forecast.solar, api.awattar.de, and api.brightsky.dev directly. TanStack Start's Netlify SSR function renders the shell; real data work runs in the browser.

**Data (`apps/pwa/src/lib/queries.ts`).** TanStack Query adapters wrap `@wattlyzer/api-client`. Results persist to `localStorage` under `wattlyzer_query_cache` for one hour. Query keys round coordinates to two decimals.

**Client state (`apps/pwa/src/lib/settings.ts`).** The settings and preferences stores remain browser-specific. Preserve the `wattlyzer_settings` and `wattlyzer_prefs` keys, legacy migrations, and synchronization between `bestSlotMode` and `ignoreSolarForBestSlot`. `toSchedulingSettings` is the boundary into the pure core package.

**Domain (`packages/core`).** `calculateSchedule` accepts a single request object, enumerates candidate starts on a UTC hour grid, and scores them by solar and/or market price:

- `combined`: choose the sunniest qualifying slot, otherwise the cheapest complete slot.
- `solar-only`: choose the sunniest qualifying slot without market data.
- `price-only`: choose the cheapest complete slot.

Power generation applies the fixed 0.7 factor and local wall-clock shading windows. Weather conditions from BrightSky take precedence over cloud cover, then fall back to the solar heuristic. Preserve these semantics and the `TZ=UTC` test coverage.

**Sky UI (`apps/pwa/src/components/sky`).** Inline styles are intentional; do not add a CSS framework. Palette data comes from `@wattlyzer/theme`. Fraunces is the display font.

**Routing (`apps/pwa/src/routes`).** `apps/pwa/src/routeTree.gen.ts` is generated; never edit it by hand.

## Critical PWA conventions

- Hydration safety and the current-time sky setting live in `apps/pwa/src/lib/use-sky-hour.ts`. It returns hour 11 for SSR and the first client render, then uses a shared mounted store. Do not replace it with per-component mounted state.
- The React Compiler is enabled. Keep components and hooks pure; use `useNow()` instead of constructing `new Date()` in render bodies.
- Scheduler slots use UTC boundaries, while roof shading uses local `getHours()` because settings describe wall-clock times.
- Safari `backdrop-filter` is paint-sensitive. Preserve the `translateZ(0)` workarounds in fixed-theme scroll cards and the filter-free settings/onboarding surfaces.

## Website conventions

The Astro site is static, bilingual, and framework-free. English routes are unprefixed and German routes use `/de/`. Keep plain CSS and Astro components; do not introduce React or a CSS framework. The animated hero imports `skyTheme` from `@wattlyzer/theme` so both languages use the same palette.

## CI, releases, and Netlify

GitHub Actions uses `nx affected` with full Git history. Release Please maintains one product release line and synchronizes the root, PWA, and marketing-site package versions.

Each app owns a `netlify.toml`. In Netlify, set package directories to `apps/pwa` and `apps/website` and leave the base directory unset. PWA build outputs are `apps/pwa/dist` plus `apps/pwa/.netlify`; website output is `apps/website/dist`.

Update this AGENTS.md together with major workspace or architectural changes.
