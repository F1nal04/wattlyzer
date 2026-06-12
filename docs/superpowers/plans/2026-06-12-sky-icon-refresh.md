# Sky Icon Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `scale`, `euro`, and `settings` SVG drawings in `WIcon` with the user-selected candidates (balance scale with pans, euro coin, classic gear) — no API changes.

**Architecture:** `src/components/sky/icons.tsx` exports `WIcon`, a single component that switches on an icon `name` and returns inline SVG (24×24 viewBox, stroke 1.7, round caps, `currentColor`). We swap three SVG bodies in place; every call site keeps working untouched.

**Tech Stack:** React 19 inline SVG, Vitest (`bun run test:run`), ESLint, TypeScript, Playwright MCP for visual verification.

**Testing note:** This is a purely presentational change — the only meaningful assertion is "does it look right at 14/18/22px", which a unit test on path strings cannot answer (it would just duplicate the constants). So no new unit tests; verification is the existing suite (guards against accidental breakage) plus scripted Playwright visual checks of all three real render contexts, per the spec.

---

### Task 1: Swap the three SVG bodies in WIcon

**Files:**
- Modify: `src/components/sky/icons.tsx:57-63` (settings), `:97-104` (euro), `:105-113` (scale)

- [x] **Step 1: Replace the `settings` branch (dotted circle → classic gear)**

Replace:

```tsx
  if (name === "settings")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="9" strokeDasharray="2 3" />
      </svg>
    );
```

with:

```tsx
  if (name === "settings")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
```

- [x] **Step 2: Replace the `euro` branch (bare € → euro coin)**

Replace:

```tsx
  if (name === "euro")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 5a7 7 0 1 0 0 14" />
        <line x1="5" y1="10" x2="14" y2="10" />
        <line x1="5" y1="14" x2="14" y2="14" />
      </svg>
    );
```

with:

```tsx
  if (name === "euro")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M14.8 8.7a3.9 3.9 0 1 0 0 6.6" />
        <line x1="8.6" y1="10.9" x2="12.8" y2="10.9" />
        <line x1="8.6" y1="13.1" x2="12.8" y2="13.1" />
      </svg>
    );
```

- [x] **Step 3: Replace the `scale` branch (circles-on-a-stick → balance scale)**

Replace:

```tsx
  if (name === "scale")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <line x1="12" y1="4" x2="12" y2="20" />
        <circle cx="6" cy="10" r="3" />
        <circle cx="18" cy="10" r="3" />
        <line x1="4" y1="20" x2="20" y2="20" />
      </svg>
    );
```

with:

```tsx
  if (name === "scale")
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="3.5" x2="12" y2="21" />
        <line x1="5" y1="6" x2="19" y2="6" />
        <path d="M5 6 L2.6 11 M5 6 L7.4 11 M2.2 11 a2.8 2.8 0 0 0 5.6 0" />
        <path d="M19 6 L16.6 11 M19 6 L21.4 11 M16.2 11 a2.8 2.8 0 0 0 5.6 0" />
        <line x1="8.5" y1="21" x2="15.5" y2="21" />
      </svg>
    );
```

- [x] **Step 4: Run the existing checks**

Run: `bun run lint && bunx tsc --noEmit && bun run test:run`
Expected: ESLint exits clean, tsc exits 0, all 38 tests pass (none touch icons; this guards against syntax/JSX slips).

### Task 2: Visual verification in all three real contexts

**Files:** none modified — Playwright MCP against the dev server.

- [x] **Step 1: Start the dev server in the background**

Run (Bash tool, `run_in_background: true`): `bun run dev`
Expected: Vite serves on http://localhost:3000.

- [x] **Step 2: Verify home app bar (gear, 18px) and quick sheet (scale + sun + coin, 14px)**

Playwright, 390×844 viewport, geolocation granted (52.39, 13.22), localStorage `wattlyzer_prefs` seeded with `{"duration":3,"searchWindow":"24","onboarded":true}`:
1. Navigate to `http://localhost:3000/`, wait for data.
2. Screenshot the app bar — right glass button must show a gear, not a dotted circle.
3. Open quick controls (left app-bar button), screenshot the sheet — mode segment must show balance scale / sun / coin, each legible, active segment dark-on-white, inactive dimmed (checks `currentColor` inheritance per spec).

- [x] **Step 3: Verify onboarding tariff row (coin, 22px)**

1. Clear `wattlyzer_prefs` (or navigate to `/onboarding` directly), advance to the "Your setup" step.
2. Screenshot — the dynamic-tariff switch row must show the coin at 22px, visually consistent with the sun row above it.

- [x] **Step 4: Stop the dev server, delete screenshots**

Kill the background dev task; remove any screenshot files created in the repo.

- [x] **Step 5: Commit**

```bash
git add -A -- . ':!.mcp.json'
git commit -m "feat(sky): redraw scale, euro, and settings icons

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
