# "Dark mode" (current-time sky) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Dark mode" setting that makes the sky palette derive from the current local hour (instead of the recommended slot / fixed midday) across every screen, plus an onboarding toggle.

**Architecture:** A shared `useSkyHour` hook centralizes the existing "pin to hour 11 until mounted" hydration-safety rule and the new `currentTimeSky` behavior. A pure `pickSkyHour` function holds the decision logic and is unit-tested. Each page derives its palette hour through the hook. Onboarding steps 0–1 force the behavior on as a preview; step 2 hosts a real toggle bound to the store.

**Tech Stack:** TanStack Start + React (React Compiler enabled), `useSyncExternalStore` settings store, inline-style "Sky" design system, `bun:test`.

---

## File Structure

- `src/lib/settings.ts` (modify) — add `currentTimeSky` field + default.
- `src/lib/use-sky-hour.ts` (create) — `SSR_SKY_HOUR`, pure `pickSkyHour`, `useSkyHour` hook.
- `src/lib/use-sky-hour.test.ts` (create) — unit tests for `pickSkyHour`.
- `src/components/sky/icons.tsx` (modify) — add a `moon` icon.
- `src/routes/index.tsx` (modify) — home page derives `themeHour` via `useSkyHour`.
- `src/routes/settings.tsx` (modify) — derive theme via `useSkyHour`; add "Appearance" toggle.
- `src/routes/onboarding.tsx` (modify) — theme via `useSkyHour(ONB_HOUR, step <= 1)`; add step-2 switch.
- `src/components/sky/install.tsx`, `text-page.tsx`, `not-found.tsx` (modify) — derive theme via `useSkyHour`.
- `AGENTS.md` (modify) — update the hydration-safety convention note.

---

## Task 1: Add the `currentTimeSky` setting

**Files:**
- Modify: `src/lib/settings.ts`

- [ ] **Step 1: Add the field to the `SettingsData` interface**

In `src/lib/settings.ts`, add the field after `ignoreSolarForBestSlot` inside `interface SettingsData`:

```ts
  bestSlotMode: BestSlotMode; // UI mode for choosing how the best timeslot should be ranked
  ignoreSolarForBestSlot: boolean; // Ignore solar production when calculating best timeslot
  currentTimeSky: boolean; // UI "Dark mode": derive the sky palette from the
                           // current local hour instead of the recommended slot
}
```

- [ ] **Step 2: Add the default**

In `defaultSettings`, after `ignoreSolarForBestSlot: false,`:

```ts
  bestSlotMode: "combined",
  ignoreSolarForBestSlot: false,
  currentTimeSky: false,
};
```

(No migration needed — `loadSavedSettings` spreads `...defaultSettings`, so older persisted settings get `false`.)

- [ ] **Step 3: Typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 4: Commit**

```bash
git add src/lib/settings.ts
git commit -m "feat(settings): add currentTimeSky (dark mode) setting"
```

---

## Task 2: Create the `useSkyHour` hook + pure `pickSkyHour` (TDD)

**Files:**
- Create: `src/lib/use-sky-hour.test.ts`
- Create: `src/lib/use-sky-hour.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/use-sky-hour.test.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { pickSkyHour, SSR_SKY_HOUR } from "./use-sky-hour";

describe("pickSkyHour", () => {
  it("returns the fixed SSR hour until mounted, ignoring everything else", () => {
    expect(
      pickSkyHour({
        mounted: false,
        currentTimeSky: true,
        preferredHour: 14,
        currentHour: 2,
      }),
    ).toBe(SSR_SKY_HOUR);
  });

  it("follows the current hour when dark mode is on", () => {
    expect(
      pickSkyHour({
        mounted: true,
        currentTimeSky: true,
        preferredHour: 14,
        currentHour: 2,
      }),
    ).toBe(2);
  });

  it("uses the preferred hour when dark mode is off", () => {
    expect(
      pickSkyHour({
        mounted: true,
        currentTimeSky: false,
        preferredHour: 14,
        currentHour: 2,
      }),
    ).toBe(14);
  });

  it("falls back to the current hour when dark mode is off and no preferred hour is given", () => {
    expect(
      pickSkyHour({
        mounted: true,
        currentTimeSky: false,
        preferredHour: undefined,
        currentHour: 2,
      }),
    ).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `TZ=UTC bun test src/lib/use-sky-hour.test.ts`
Expected: FAIL — cannot resolve `./use-sky-hour` (module does not exist yet).

- [ ] **Step 3: Implement the hook + pure function**

Create `src/lib/use-sky-hour.ts`:

```ts
import { useEffect, useState } from "react";
import { useNow } from "./use-now";
import { useSettings } from "./settings";

// Fixed hour for SSR + the first client render. React never patches hydration
// attribute mismatches, so the palette must match the server until the client
// has mounted (see AGENTS.md "Critical conventions").
export const SSR_SKY_HOUR = 11;

// Pure decision: which local hour should feed `skyTheme`.
// - not mounted -> fixed SSR hour (hydration safety) wins over everything
// - dark mode on -> the current local hour
// - otherwise -> the page's preferred hour, falling back to the current hour
export function pickSkyHour(opts: {
  mounted: boolean;
  currentTimeSky: boolean;
  preferredHour: number | undefined;
  currentHour: number;
}): number {
  if (!opts.mounted) return SSR_SKY_HOUR;
  if (opts.currentTimeSky) return opts.currentHour;
  return opts.preferredHour ?? opts.currentHour;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

// Local hour the sky palette should derive from. Centralizes the
// hydration-safety convention and the "Dark mode" (currentTimeSky) behavior.
// `forceCurrentTime` lets a caller treat dark mode as on without changing the
// stored setting (used by onboarding steps 0/1).
export function useSkyHour(
  preferredHour?: number,
  forceCurrentTime = false,
): number {
  const mounted = useMounted();
  const now = useNow();
  const { settings } = useSettings();
  return pickSkyHour({
    mounted,
    currentTimeSky: forceCurrentTime || settings.currentTimeSky,
    preferredHour,
    currentHour: now.getHours(),
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `TZ=UTC bun test src/lib/use-sky-hour.test.ts`
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/use-sky-hour.ts src/lib/use-sky-hour.test.ts
git commit -m "feat(sky): add useSkyHour hook + pickSkyHour decision logic"
```

---

## Task 3: Add a `moon` icon

**Files:**
- Modify: `src/components/sky/icons.tsx`

- [ ] **Step 1: Extend the `WIconName` union**

In `src/components/sky/icons.tsx`, add `"moon"` to the union:

```ts
export type WIconName =
  | "cloud"
  | "sunCloud"
  | "cloudRain"
  | "settings"
  | "sliders"
  | "back"
  | "sun"
  | "euro"
  | "scale"
  | "moon";
```

- [ ] **Step 2: Add the render branch**

In the `WIcon` component, add this branch before the final `return null;` (after the `scale` branch):

```tsx
  if (name === "moon")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14.5A8 8 0 0 1 9.5 4 6.5 6.5 0 1 0 20 14.5z" />
      </svg>
    );
```

- [ ] **Step 3: Typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/sky/icons.tsx
git commit -m "feat(icons): add moon icon"
```

---

## Task 4: Wire the home page to `useSkyHour`

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Import the hook**

Add to the imports near the top of `src/routes/index.tsx` (next to the `use-now` import):

```ts
import { useSkyHour } from "@/lib/use-sky-hour";
```

- [ ] **Step 2: Replace the `themeHour` computation**

Replace this block (currently around lines 86–95):

```ts
  // Theme follows the recommended hour; before a result exists, the current
  // hour. Until mounted it must be a fixed hour so the server-rendered and
  // first client render agree — React never patches hydration mismatches,
  // which would freeze the background on the server's palette.
  const themeHour = !mounted
    ? 11
    : schedulingResult
      ? schedulingResult.bestTime.getHours()
      : now.getHours();
  const t = skyTheme(themeHour);
```

with:

```ts
  // Theme follows the recommended slot's hour, or — when "Dark mode" is on —
  // the current hour. useSkyHour also pins the palette to a fixed hour until
  // mounted so SSR and the first client render agree (hydration safety).
  const themeHour = useSkyHour(
    schedulingResult ? schedulingResult.bestTime.getHours() : now.getHours(),
  );
  const t = skyTheme(themeHour);
```

(`mounted` stays — it still gates the render tree and the onboarding redirect. `now` and `schedulingResult` stay in use.)

- [ ] **Step 3: Typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat(home): derive sky palette hour via useSkyHour"
```

---

## Task 5: Wire settings page + add the "Appearance" toggle

**Files:**
- Modify: `src/routes/settings.tsx`

- [ ] **Step 1: Update imports**

Change the React import (drop `useEffect`, keep `useState`):

```ts
import { useState, type ReactNode } from "react";
```

Remove the `useNow` import line:

```ts
import { useNow } from "@/lib/use-now";   // <-- delete this line
```

Add the hook import (next to the settings import):

```ts
import { useSkyHour } from "@/lib/use-sky-hour";
```

- [ ] **Step 2: Replace the local mounted/now theme computation**

Replace these lines (currently around 224–228):

```ts
  const [solarOpen, setSolarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const now = useNow();
  useEffect(() => setMounted(true), []);

  const t = skyTheme(mounted ? now.getHours() : 11);
```

with:

```ts
  const [solarOpen, setSolarOpen] = useState(false);
  const themeHour = useSkyHour();
  const t = skyTheme(themeHour);
```

(`settings` and `updateSettings` are already imported via `useSettings()`/`updateSettings`.)

- [ ] **Step 3: Add the "Appearance" group**

Insert a new group immediately before `<SetGroup title="More" t={t}>`:

```tsx
        <SetGroup title="Appearance" t={t}>
          <SetToggleRow
            label="Dark mode"
            detail="Match the sky to now, not the chosen slot"
            on={settings.currentTimeSky}
            onToggle={() =>
              updateSettings({ currentTimeSky: !settings.currentTimeSky })
            }
            t={t}
            last
          />
        </SetGroup>
```

- [ ] **Step 4: Typecheck + lint**

Run: `bunx tsc --noEmit && bun run lint`
Expected: PASS (no unused-import errors for `useEffect`/`useNow`).

- [ ] **Step 5: Commit**

```bash
git add src/routes/settings.tsx
git commit -m "feat(settings): derive theme via useSkyHour; add Dark mode toggle"
```

---

## Task 6: Wire onboarding + add the step-2 switch

**Files:**
- Modify: `src/routes/onboarding.tsx`

- [ ] **Step 1: Update imports**

Add `useSettings` to the settings import:

```ts
import { updatePrefs, updateSettings, useSettings } from "@/lib/settings";
```

Add the hook import (below the existing imports near the top):

```ts
import { useSkyHour } from "@/lib/use-sky-hour";
```

- [ ] **Step 2: Read settings + render the switch in `ObSetup`**

In `function ObSetup({ ... })`, add the settings read at the top of the body:

```ts
  const [consentShare, setConsentShare] = useState(false);
  const [solarOpen, setSolarOpen] = useState(false);
  const { settings } = useSettings();
```

Then, in the JSX, insert a new `ObSwitchRow` immediately after the "Dynamic tariff" `ObSwitchRow` (the one with `icon="euro"`) and before the `<ObCheckRow ...>`:

```tsx
        <ObSwitchRow
          t={t}
          icon="moon"
          title="Dark mode"
          subtitle="Match the sky to the current time"
          checked={settings.currentTimeSky}
          onChange={() =>
            updateSettings({ currentTimeSky: !settings.currentTimeSky })
          }
        />
```

- [ ] **Step 3: Drive the onboarding theme from `useSkyHour` with a per-step override**

In `function OnboardingScreen()`, reorder so `step` is declared before the theme, and replace the fixed theme:

Replace (currently around lines 569–571):

```ts
  const navigate = useNavigate();
  const t = skyTheme(ONB_HOUR);
  const [step, setStep] = useState(0);
```

with:

```ts
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  // Steps 0 (Welcome) and 1 (How) preview the current-time sky regardless of
  // the stored setting; steps 2/3 follow the actual "Dark mode" toggle.
  const themeHour = useSkyHour(ONB_HOUR, step <= 1);
  const t = skyTheme(themeHour);
```

- [ ] **Step 4: Typecheck + lint**

Run: `bunx tsc --noEmit && bun run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/routes/onboarding.tsx
git commit -m "feat(onboarding): preview dark sky on steps 0-1; add step-2 toggle"
```

---

## Task 7: Wire the fixed-hour brand pages

**Files:**
- Modify: `src/components/sky/install.tsx`
- Modify: `src/components/sky/text-page.tsx`
- Modify: `src/components/sky/not-found.tsx`

- [ ] **Step 1: `install.tsx`**

Add the import (after the existing icon/primitive imports):

```ts
import { useSkyHour } from "@/lib/use-sky-hour";
```

In `function InstPage(...)`, replace:

```ts
  const t = skyTheme(INST_HOUR);
```

with:

```ts
  const t = skyTheme(useSkyHour(INST_HOUR));
```

- [ ] **Step 2: `text-page.tsx`**

Add the import:

```ts
import { useSkyHour } from "@/lib/use-sky-hour";
```

In `function TextPage(...)`, replace:

```ts
  const t = skyTheme(PAGE_HOUR);
```

with:

```ts
  const t = skyTheme(useSkyHour(PAGE_HOUR));
```

- [ ] **Step 3: `not-found.tsx`**

Add the import (after the primitives import):

```ts
import { useSkyHour } from "@/lib/use-sky-hour";
```

Replace the comment + line:

```ts
// Fixed hour so server and client render the same palette (same pattern
// as the text/install pages)
const PAGE_HOUR = 11;

export function NotFound() {
  const t = skyTheme(PAGE_HOUR);
```

with:

```ts
// Default to a fixed midday hour; useSkyHour keeps SSR/first-render hydration
// safe and follows the current time when "Dark mode" is on.
const PAGE_HOUR = 11;

export function NotFound() {
  const t = skyTheme(useSkyHour(PAGE_HOUR));
```

- [ ] **Step 4: Typecheck + lint**

Run: `bunx tsc --noEmit && bun run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sky/install.tsx src/components/sky/text-page.tsx src/components/sky/not-found.tsx
git commit -m "feat(sky): brand pages follow current time when dark mode on"
```

---

## Task 8: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Replace the hydration-safety bullet**

In the "Critical conventions" section, replace this bullet:

```
- **Hydration safety: pin the theme hour to `11` until mounted.** Pages compute `skyTheme` from a fixed hour during SSR/first client render, switching to the live hour only after `mounted` flips. React never patches hydration attribute mismatches, so a live clock in render would freeze the background on the server's palette. Every page follows this — preserve it.
```

with:

```
- **Hydration safety + "Dark mode" live in `useSkyHour` (`src/lib/use-sky-hour.ts`).** Every page derives its sky-palette hour through this hook. It returns a fixed hour (`11`) during SSR and the first client render — switching to the live hour only after `mounted` flips — because React never patches hydration attribute mismatches. The hook also implements the `currentTimeSky` setting ("Dark mode" in the UI): when on, the palette follows the current local hour instead of the page's preferred hour (e.g. the home page's recommended slot). Onboarding steps 0–1 force it on as a preview via `useSkyHour(hour, true)`, independent of the stored setting. Pure decision logic is `pickSkyHour` (unit-tested in `use-sky-hour.test.ts`) — preserve this structure.
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs(agents): document useSkyHour + dark mode convention"
```

---

## Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS.

- [ ] **Step 2: Lint**

Run: `bun run lint`
Expected: PASS (no errors).

- [ ] **Step 3: Unit tests**

Run: `bun run test:run`
Expected: PASS (existing suite + the 4 new `pickSkyHour` tests).

- [ ] **Step 4: Production build**

Run: `bun run build`
Expected: build completes; client + SSR function emitted.

- [ ] **Step 5: Manual smoke (optional but recommended)**

Run: `bun dev`, then:
- Settings → Appearance → toggle "Dark mode": at a dark local hour, the home background turns dark even when the recommended slot is in daytime; the hero still shows the recommended slot's sun.
- Onboarding steps 0/1 show the current-time sky; step 2 has a "Dark mode" switch that live-updates that screen's background.

---

## Notes for the implementer

- **React Compiler is enabled.** Keep bodies pure; never call `new Date()` in render — `useSkyHour` relies on `useNow()` for that. `pickSkyHour` is pure by design.
- **Tests run under `TZ=UTC`**, so `currentHour` in tests equals UTC. The `pickSkyHour` tests pass explicit numbers, so they're timezone-independent regardless.
- **Don't hand-edit `src/routeTree.gen.ts`** — nothing here requires it.
- Commit messages above intentionally omit any co-author trailer.
