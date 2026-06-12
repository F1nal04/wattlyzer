# Sky icon refresh — design

Date: 2026-06-12
Status: approved (visual candidates selected via brainstorm session, design approved in chat)

## Goal

Replace three icons the user dislikes with clearer drawings, chosen from rendered
candidates in a visual brainstorm session:

| Icon name  | Used by                                                        | Current drawing            | New drawing |
| ---------- | -------------------------------------------------------------- | -------------------------- | ----------- |
| `scale`    | "Both" option in `SkyModeSeg` (14px)                           | Two circles on a stick     | Proper balance scale: center post, beam, two hanging pans (strings + arc), base |
| `euro`     | "Price" option in `SkyModeSeg` (14px); dynamic-tariff row in onboarding (22px) | Bare € glyph               | Euro coin: € glyph inside a circle |
| `settings` | Home app-bar button → `/settings` (18px default)               | Dotted circle with a dot   | Classic gear: cog outline + center circle (lucide-style path) |

The `sun` icon is explicitly kept unchanged (user choice). The `sliders`
quick-controls icon is unchanged (user is happy with it).

## Scope

- Single file: `src/components/sky/icons.tsx` — swap the SVG bodies behind the
  existing `WIcon` names `scale`, `euro`, `settings`.
- No API changes: same `WIconName` union, same props, same call sites.
- No logic, route, type, or test changes.

## Non-goals

- No new icon names or icon component refactor.
- No changes to `sun`, `sliders`, `back`, cloud icons, or `InstGlyph`.

## Drawing constraints

- 24×24 viewBox, `stroke-width` 1.7, round caps/joins, `currentColor` — matching
  the rest of the set.
- Must stay legible at the smallest real render size (14px in the mode segment).
  The balance scale uses simplified pans (one arc each) for this reason.
- The coin's € must not touch the coin rim (inner glyph scaled to r≈4 inside r=8.5).

## Verification

1. `bun run lint`, `bunx tsc --noEmit`, `bun run test:run` all pass.
2. Playwright visual check at 390×844:
   - Quick sheet open: mode segment shows scale/sun/coin at 14px, all three legible.
   - Home app bar: gear renders in the right glass button.
   - Onboarding "Your setup" step: tariff row shows the coin at 22px.
3. Icons inherit theme color (`currentColor`) — verify in both an active (dark on
   white) and inactive (dim) segment state.
