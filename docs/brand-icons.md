# Wattlyzer brand icons

The brand mark is a sun rising behind a cream ribbon “W” on an
orange-to-plum sunset tile. It is used only as the website favicon and the
PWA's favicon and app icons, not inside either app's pages. The vector
sources live in `docs/brand/`:

| Source | Purpose |
| --- | --- |
| `logo.svg` | The approved artwork: rounded sunset tile with a soft drop shadow |
| `app-icon.svg` | `logo.svg` with the tile made full-bleed and square and the shadow removed, for launcher icons that the OS masks itself |

`app-icon.svg` keeps the mark at full size: every part of it already sits
inside the maskable safe zone (the centred circle of 40 % radius).

## Published variants

| Asset | Published by | Source |
| --- | --- | --- |
| `favicon.svg` | PWA and website | copy of `docs/brand/logo.svg` |
| `favicon.ico` | PWA and website | the approved ICO (16 to 256 px PNG entries) |
| `favicon-96x96.png` | PWA and website | `logo.svg` at 96 px |
| `apple-touch-icon.png` | PWA | `app-icon.svg` at 180 px |
| `web-app-manifest-192x192.png` | PWA | `app-icon.svg` at 192 px |
| `web-app-manifest-512x512.png` | PWA | `app-icon.svg` at 512 px |

The two apps' copies of `favicon.svg`, `favicon.ico`, and `favicon-96x96.png`
must stay byte-for-byte identical. The launcher images are declared
`maskable` in `apps/pwa/public/site.webmanifest`; do not scale the artwork
past the safe zone.

## Updating the set

1. Replace `docs/brand/logo.svg` and derive `app-icon.svg` from it (square
   full-bleed tile, no drop shadow).
2. Rasterize each published PNG from its source at the listed size with any
   SVG renderer (for example a headless Chromium screenshot or
   `rsvg-convert`), and regenerate `favicon.ico` from `logo.svg`.
3. Copy the shared favicon files into both apps' `public/` directories.
   Preserve the manifest's `/` `id` and `start_url` fields.
4. Run `bun run check`, then inspect a browser tab and a freshly installed PWA
   on both a rounded and square launcher mask.

Browsers and operating systems cache favicons and installed-app icons
aggressively. An existing install can keep the previous artwork after a normal
refresh; close all tabs and clear site data for browser-icon testing, and
uninstall/reinstall the PWA or home-screen shortcut when verifying launcher
icons.
