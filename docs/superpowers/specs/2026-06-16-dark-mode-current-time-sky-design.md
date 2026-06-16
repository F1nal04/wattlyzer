# "Dark mode" — sky palette follows current time

**Date:** 2026-06-16
**Status:** Approved

## Problem

The home page derives its background palette from the **recommended slot's hour**
(`src/routes/index.tsx` `themeHour`), not the current time. So when the best
charging slot is in daytime but you open the app at night, the screen shows a
bright daytime sky. Users want an option to keep the sky dark when it is
actually dark out, regardless of when the recommended slot falls.

## Behavior

Add a settings toggle, labelled **"Dark mode"** in the UI, that — when enabled —
makes the sky palette on **every screen** derive from the **current local hour**
instead of the page's default hour.

- Toggle ON: the palette always follows the current local hour. Night → dark
  sky; day → bright sky; independent of the recommended slot.
- Toggle OFF (default): unchanged behavior — home themes by the recommended
  slot, brand pages stay at their fixed daytime palette, settings follows the
  current hour.

This is **not** a true dark theme; it only changes which hour feeds `skyTheme`.

### Scope of "every screen"

| Screen | Default hour (toggle OFF) | Toggle ON |
| --- | --- | --- |
| Home (`index.tsx`) | recommended slot, else current | current hour |
| Settings (`settings.tsx`) | current hour (already) | current hour (no change) |
| Onboarding, Install, Legal/Privacy (`text-page`), 404 | fixed `11` | current hour |

### Hero note

The hero sun/moon position is driven by a separate `heroHour`
(`index.tsx:187`), so with the toggle on at night a daytime best-slot still
shows a bright hero sun over a dark sky. That is the intended effect; sun colors
(`sunCore`/`sunMid`/`sunOuter`) are theme-independent, so it renders cleanly.

## Design

### 1. Settings store (`src/lib/settings.ts`)

Add to `SettingsData` and `defaultSettings`:

```ts
currentTimeSky: boolean; // UI "Dark mode": derive the sky palette from the
                         // current local hour instead of the recommended slot
```

Default `false`. Existing persisted settings pick up the default via the
`...defaultSettings` spread in `loadSavedSettings`; no migration needed. No
cross-flag `transform` logic required.

### 2. New `src/lib/use-sky-hour.ts`

A pure decision function plus a thin hook that wires in the stores. This
centralizes the "pin to 11 until mounted" hydration-safety convention that is
currently duplicated across pages.

```ts
export const SSR_SKY_HOUR = 11;

export function pickSkyHour(opts: {
  mounted: boolean;
  currentTimeSky: boolean;
  preferredHour: number | undefined;
  currentHour: number;
}): number {
  if (!opts.mounted) return SSR_SKY_HOUR;        // hydration-safe fixed palette
  if (opts.currentTimeSky) return opts.currentHour; // "Dark mode"
  return opts.preferredHour ?? opts.currentHour;
}

export function useSkyHour(preferredHour?: number): number {
  // useMounted + useNow + useSettings, then pickSkyHour(...)
}
```

Precedence is deliberate: the un-mounted fixed hour wins over everything (React
never patches hydration attribute mismatches), and `currentTimeSky` beats the
preferred hour.

### 3. Wire each page to `useSkyHour`

- `index.tsx`:
  `const themeHour = useSkyHour(schedulingResult ? schedulingResult.bestTime.getHours() : now.getHours());`
  Removes the inline `!mounted ? 11 : …` ternary. Home keeps its own `mounted`
  (render gate, onboarding redirect) and `now` (scheduling).
- `settings.tsx`: `const t = skyTheme(useSkyHour());` and drop the now-unused
  local `mounted`/`now`/`useEffect` boilerplate. Behavior is identical (it
  already followed the current hour).
- `onboarding.tsx`, `install.tsx`, `text-page.tsx`, `not-found.tsx`: replace the
  fixed `skyTheme(11)` with `skyTheme(useSkyHour(11))`. These now switch from
  the fixed palette to the live hour after mount when the toggle is on —
  hydration-safe because the hook returns `11` until mounted.

Hydration: `useSettings` is read via `useSyncExternalStore`, but `useSkyHour`
returns `11` until `mounted`, so the persisted `currentTimeSky` value never
affects the first (hydrating) render — no mismatch.

### 4. Settings UI (`src/routes/settings.tsx`)

A new `SetGroup title="Appearance"` containing one `SetToggleRow`:

- label: **"Dark mode"**
- detail: **"Match the sky to now, not the chosen slot"**
- `on={settings.currentTimeSky}`,
  `onToggle={() => updateSettings({ currentTimeSky: !settings.currentTimeSky })}`

Placed before the existing "More" group.

### 5. Tests

`src/lib/use-sky-hour.test.ts` (bun:test) for `pickSkyHour`:

- `!mounted` → `11` even when `currentTimeSky` is true and a preferred hour is set
- `currentTimeSky` true → `currentHour` (ignores preferred)
- `currentTimeSky` false, preferred set → preferred
- `currentTimeSky` false, preferred undefined → `currentHour`

### 6. Docs

Update AGENTS.md "Critical conventions": the "pin the theme hour to 11 until
mounted" rule now lives in `useSkyHour` (`src/lib/use-sky-hour.ts`); note the new
`currentTimeSky` setting and that all pages derive their hour through the hook.

## Out of scope

- A real dark color theme / custom palettes.
- Changing the hero sun/moon to follow current time.
- Any change to scheduling, prices, or weather logic.
