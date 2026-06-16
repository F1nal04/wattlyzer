# "Dark mode" — sky palette follows current time

**Date:** 2026-06-16
**Status:** Approved (revised)

## Problem

The home page derives its background palette from the **recommended slot's hour**
(`src/routes/index.tsx` `themeHour`), not the current time. So when the best
charging slot is in daytime but you open the app at night, the screen shows a
bright daytime sky. Users want an option to keep the sky dark when it is
actually dark out, regardless of when the recommended slot falls.

## Behavior

Add a setting, labelled **"Dark mode"** in the UI, that — when enabled — makes
the sky palette on **every screen** derive from the **current local hour**
instead of the page's default hour.

- Toggle ON: the palette always follows the current local hour. Night → dark
  sky; day → bright sky; independent of the recommended slot.
- Toggle OFF: home themes by the recommended slot, brand pages stay at their
  fixed daytime palette, settings follows the current hour.

This is **not** a true dark theme; it only changes which hour feeds `skyTheme`.

### Defaults

`currentTimeSky` defaults to **`false`** (off). The app keeps its original
behavior by default: the home page themes by the recommended slot, brand pages
stay at their fixed midday palette. The user opts in via the "Dark mode" toggle.

**Exception — onboarding steps 0 and 1 are hardwired on.** The Welcome (step 0)
and How (step 1) screens always render with the current-time sky as a preview,
regardless of the stored `currentTimeSky` value. This is a per-step override in
onboarding only; it does **not** change the stored setting. Step 2 (which hosts
the switch) and step 3 follow the actual setting.

### Scope of "every screen"

| Screen | Toggle OFF (default) | Toggle ON |
| --- | --- | --- |
| Home (`index.tsx`) | recommended slot, else current | current hour |
| Settings (`settings.tsx`) | current hour (already) | current hour (no change) |
| Onboarding step 2 / step 3 | fixed `11` | current hour |
| Onboarding step 0 / step 1 | current hour (hardwired) | current hour |
| Install, Legal/Privacy (`text-page`), 404 | fixed `11` | current hour |

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

export function useSkyHour(preferredHour?: number, forceCurrentTime = false): number {
  // const mounted = useMounted(); const now = useNow();
  // const { settings } = useSettings();
  // return pickSkyHour({
  //   mounted,
  //   currentTimeSky: forceCurrentTime || settings.currentTimeSky,
  //   preferredHour,
  //   currentHour: now.getHours(),
  // });
}
```

`forceCurrentTime` lets a caller (onboarding steps 0/1) treat dark mode as on
without touching the stored setting; it ORs into `currentTimeSky` before the
pure decision. `pickSkyHour` itself stays a pure 4-input function.

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
- `onboarding.tsx`: `const t = skyTheme(useSkyHour(ONB_HOUR, step <= 1));` —
  steps 0/1 force current-time; steps 2/3 follow the setting (see §5).
- `install.tsx`, `text-page.tsx`, `not-found.tsx`: replace the fixed
  `skyTheme(11)` with `skyTheme(useSkyHour(11))`. These now switch from the
  fixed palette to the live hour after mount when the toggle is on —
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

### 5. Onboarding toggle (`src/routes/onboarding.tsx`)

- **Step 2 (`ObSetup`)** gains an `ObSwitchRow`:
  - title: **"Dark mode"**, subtitle: **"Match the sky to the current time"**
  - icon: a moon icon (`WIcon`) if available, else the closest existing icon.
  - Wired **directly to the settings store** (not local step state): reads
    `settings.currentTimeSky` and toggles via
    `updateSettings({ currentTimeSky: !settings.currentTimeSky })`.
  - Placed right after the "Dynamic tariff" `ObSwitchRow`, before the consent
    `ObCheckRow` (which gates the Continue button — keep it last).
- Writing immediately (rather than deferring to `finish`) makes the onboarding
  background **live-preview**: toggling re-runs `useSkyHour(ONB_HOUR)` and
  re-themes the screen instantly.
- `OnboardingScreen` adds `useSettings()` to read `currentTimeSky` for the
  switch's checked state; the theme comes from `useSkyHour(ONB_HOUR, step <= 1)`.
- Steps 0 and 1 are hardwired to the current-time sky via the `step <= 1`
  override, independent of the stored setting. When the user advances to step 2
  with dark mode off (the default), the background switches from current-time to
  the fixed midday palette — an expected, deliberate transition.

### 6. Tests

`src/lib/use-sky-hour.test.ts` (bun:test) for `pickSkyHour`:

- `!mounted` → `11` even when `currentTimeSky` is true and a preferred hour is set
- `currentTimeSky` true → `currentHour` (ignores preferred)
- `currentTimeSky` false, preferred set → preferred
- `currentTimeSky` false, preferred undefined → `currentHour`

### 7. Docs

Update AGENTS.md "Critical conventions": the "pin the theme hour to 11 until
mounted" rule now lives in `useSkyHour` (`src/lib/use-sky-hour.ts`); note the new
`currentTimeSky` setting (default off) and that all pages derive their hour
through the hook.

## Out of scope

- A real dark color theme / custom palettes.
- Changing the hero sun/moon to follow current time.
- Any change to scheduling, prices, or weather logic.
