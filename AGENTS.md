## Commands

- `bun install` — install all workspace dependencies from the single root `bun.lock`.
- `bun run dev` — start the PWA and website dev servers together through Nx.
- `bun run dev:pwa` — PWA dev server on port 3000 with Netlify emulation.
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
- `packages/legal` — the § 5 TMG impressum (operator, contact address, informational-use statement) in English and German. Both apps render it, so the two legal notices cannot state different things.
- `packages/i18n` — framework-independent locale model (`en` default, `de`), Accept-Language style detection, the pure `resolveLocale` decision, `LOCALE_META`/`localeOptions` behind both apps' language switchers, the `createTranslator` catalog factory, `Intl` number formatting, and `{name}` message interpolation. Shared by both apps.

Workspace packages are private source packages imported through their `@wattlyzer/*` public entrypoints and declared with `workspace:*`. Do not import another project's internal files. Nx tags and ESLint enforce the intended graph: apps may consume shared packages, `api-client` may consume `core`, the website may consume `theme`, `i18n`, and `legal` only, and platform-agnostic packages must not depend on apps, React, browser storage, DOM APIs, or UI frameworks.

For a future Expo app, add `apps/mobile` and reuse `core`, `api-client`, `theme`, `i18n`, and `legal`. Keep geolocation, persistence, Query integration, and UI behind platform-specific adapters. Do not attempt to share React DOM/Astro UI components with React Native.

## PWA architecture

**Local-first, no application backend.** The browser calls forecast.solar, api.awattar.de, and api.brightsky.dev directly. TanStack Start's Netlify SSR function renders the shell; real data work runs in the browser.

**Data (`apps/pwa/src/lib/queries.ts`).** TanStack Query adapters wrap `@wattlyzer/api-client`. Results persist to `localStorage` under `wattlyzer_query_cache` for one hour. Query keys round coordinates to two decimals.

**Locale (`apps/pwa/src/lib/locale.ts`, `apps/pwa/src/lib/i18n/`).** The catalogs are the app's, the mechanics come from `createTranslator` in `@wattlyzer/i18n`. `wattlyzer_locale` persists *only* the explicit choice (`{ "locale": "de" }`, or `null` for automatic); it never touches `wattlyzer_settings` or `wattlyzer_prefs`, and detection is never written back, so a later browser-language change still applies. `en.ts` is the source of truth for `MessageKey` and `de.ts` is a `Record<MessageKey, string>`, so a missing translation fails `typecheck`. Numbers go through `useI18n().decimal`/`.integer`; headline emphasis is a `{slot}` filled by `richParts` so translations own word order. Pure helpers return message keys or take a `Translate` — never English literals, and never branch on formatted copy.

**Cross-domain links.** Website install links use `https://pwa.wattlyzer.de` with `?lang=en` or `?lang=de`. The PWA consumes this explicit choice once after the root mounts and persists it through `setLocale`; SSR and the first client render stay English, and subsequent Settings choices can override it.

**Client state (`apps/pwa/src/lib/settings.ts`).** The settings and preferences stores remain browser-specific. Preserve the `wattlyzer_settings` and `wattlyzer_prefs` keys, legacy migrations, and synchronization between `bestSlotMode` and `ignoreSolarForBestSlot`. Persist `solarPanels` and `dynamicTariff` independently of `bestSlotMode`: the two describe what the household *has*, the mode only describes how slots are ranked. Collapsing either into the mode means picking `price-only` reads as "the panels are gone", which switches them off and then locks the mode picker to `price-only`. Independent flags also let panels-off plus no tariff be detected as an empty product instead of a fake `price-only` schedule. Query gating is the one thing that stays keyed on the mode, so `price-only` never blocks on forecast.solar. `toSchedulingSettings` is the boundary into the pure core package.

**Domain (`packages/core`).** `calculateSchedule` accepts a single request object, enumerates candidate starts on a UTC hour grid, and scores them by solar and/or market price:

- `combined`: choose the sunniest qualifying slot, otherwise the cheapest complete slot.
- `solar-only`: choose the sunniest qualifying slot without market data.
- `price-only`: choose the cheapest complete slot.

Each mode requires only the signal it cannot score without: `price-only` needs market rows and never blocks on forecast.solar, and `combined` needs only the solar half, degrading to the sunniest qualifying slot when aWATTar is down.

forecast.solar keys its result with **naive wall-clock stamps in the roof's timezone**, not UTC — `new Date(key)` would resolve them against the device's zone and shift the whole curve. `calculatePowerGeneration` recovers the offset from `message.info.time` vs `.time_utc` and the cumulative-Wh daily reset keys off the stamp's own date. `hoursUntilEndOfLocalDay` is the only correct source for the "end of day" window; it counts from `ceilToUtcHour(now)`, the same anchor `calculateSchedule` enumerates from, so do not measure it from `now` in a route.

Power generation applies the fixed 0.7 factor and local wall-clock shading windows. Weather conditions from BrightSky take precedence over cloud cover, then fall back to the solar heuristic. Preserve these semantics and the `TZ=UTC` test coverage.

**Sky UI (`apps/pwa/src/components/sky`).** Inline styles are intentional; do not add a CSS framework. Palette data comes from `@wattlyzer/theme`. Fraunces is the display font.

**Routing (`apps/pwa/src/routes`).** `apps/pwa/src/routeTree.gen.ts` is generated; never edit it by hand.

## Critical PWA conventions

- Hydration safety and the current-time sky setting live in `apps/pwa/src/lib/use-sky-hour.ts`. It returns hour 11 for SSR and the first client render, then uses a shared mounted store. Do not replace it with per-component mounted state.
- The React Compiler is enabled. Keep components and hooks pure; use `useNow()` instead of constructing `new Date()` in render bodies.
- Scheduler slots use UTC boundaries, while roof shading uses local `getHours()` because settings describe wall-clock times.
- The active locale is `en` for SSR and the first client render. `useLocale()` gates on the same `useMounted()` store as `useSkyHour` and delegates to the pure `resolveLocale`. Never read `navigator.languages` in a render body — that is what makes hydration diverge. `<html lang>`, the title, and the description are mutated in an effect rather than rendered, because React never patches hydration attribute mismatches.
- Safari `backdrop-filter` is paint-sensitive. Every frosted surface must use `frostedGlass()` from `apps/pwa/src/components/sky/glass.ts` (both filter prefixes plus `translateZ(0)`). Do not wrap those surfaces in an ancestor opacity animation. Settings and onboarding stay filter-free and use the translucent theme fill instead.

## Website conventions

The Astro site is static, bilingual, and framework-free. English routes are unprefixed and German routes use `/de/`; add and update both language routes together. Keep plain CSS and Astro components; do not introduce React or a CSS framework. Fonts are fetched at build time through Astro and exposed as CSS variables. The animated hero imports `skyTheme` from `@wattlyzer/theme` so both languages use the same palette, and `Layout.astro` takes its locale set from `@wattlyzer/i18n`. Do not duplicate palette logic in pages. The hero hour strip uses both `backdrop-filter` prefixes plus `translateZ(0)` for Safari. `astro.config.mjs` cannot import the package (Astro reads the config before workspace resolution), so `apps/website/i18n.test.ts` guards the two against drifting apart.

The language switcher is `src/components/LanguageToggle.astro` — one component with `nav` / `nav-mobile` / `footer` variants, driven by `localeOptions`. Never hand-write a `lang-btn` in a page; it was copy-pasted into eight places before, each with its own hard-coded active locale. Its class names are load-bearing for `index.css` and `legal.css`.

`/legal/` and `/de/legal/` are thin routes over `src/components/LegalPage.astro`. Only page chrome lives in `src/i18n/legal.ts`; the impressum itself comes from `@wattlyzer/legal`, shared with the PWA. The landing pages are still hand-duplicated: `index.astro` and `de/index.astro` have identical markup and only differ in copy, and `hero.test.ts` reads their markup directly, so converting them is a separate change.

## CI, releases, and Netlify

GitHub Actions uses `nx affected` with full Git history. Release Please maintains one product release line and synchronizes the root, PWA, and marketing-site package versions.

Each app owns a `netlify.toml`. In Netlify, set package directories to `apps/pwa` and `apps/website` and leave the base directory unset. PWA build outputs are `apps/pwa/dist` plus `apps/pwa/.netlify`; website output is `apps/website/dist`.

## Crawler policy

The two Netlify sites publish independent crawler policies. Do not point one app's `robots.txt` or sitemap at the other site.

- **Website (`wattlyzer.de`)** — crawlable. `apps/website/public/robots.txt` allows `/` and references `https://wattlyzer.de/sitemap-index.xml`. `@astrojs/sitemap` generates that index from `site: "https://wattlyzer.de"` in `apps/website/astro.config.mjs`. Canonical and `hreflang` URLs are emitted from `Astro.site` in `apps/website/src/layouts/Layout.astro`.
- **PWA (`pwa.wattlyzer.de`)** — not crawlable or indexable. `apps/pwa/public/robots.txt` contains `Disallow: /`. The root document head includes `noindex, nofollow`, and `apps/pwa/netlify.toml` sends `X-Robots-Tag: noindex, nofollow` on every path.

`verify-seo` runs after each app's build and checks the published `dist` artifacts. `bun run check` and `bun run affected` include that target.

Update this AGENTS.md together with major workspace or architectural changes.
