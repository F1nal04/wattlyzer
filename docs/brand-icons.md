# Wattlyzer brand icons

The brand mark is a sun rising behind a ribbon “W”, in its sunset palette:
a warm yellow sun with four rays above the W, which cuts a gap into the sun's
lower edge. The mark is used only as the website favicon and the PWA's
favicon and app icons, not inside either app's pages. The vector sources live
in `docs/brand/`:

| Source | Purpose |
| --- | --- |
| `favicon.svg` | Coral-to-rose W and orange sun on a white rounded tile, for browser tabs |
| `app-icon.svg` | Cream W on a full-bleed orange-to-plum sunset tile, mark at 74 %, for iOS |
| `app-icon-maskable.svg` | Same tile, mark at 64 % so it stays inside the maskable safe zone |

## Published variants

| Asset | Published by | Rendered from |
| --- | --- | --- |
| `favicon.svg` | PWA and website | copy of `docs/brand/favicon.svg` |
| `favicon.ico` | PWA and website | `favicon.svg` at 16, 32, and 48 px (PNG entries) |
| `favicon-96x96.png` | PWA and website | `favicon.svg` at 96 px |
| `apple-touch-icon.png` | PWA | `app-icon.svg` at 180 px |
| `web-app-manifest-192x192.png` | PWA | `app-icon-maskable.svg` at 192 px |
| `web-app-manifest-512x512.png` | PWA | `app-icon-maskable.svg` at 512 px |

The two apps' copies of `favicon.svg`, `favicon.ico`, and `favicon-96x96.png`
must stay byte-for-byte identical. The launcher images are declared
`maskable` in `apps/pwa/public/site.webmanifest`; do not scale the artwork
past the safe zone.

## Updating the set

1. Edit the SVG sources in `docs/brand/`.
2. Rasterize each published PNG from its source at the listed size with any
   SVG renderer (for example a headless Chromium screenshot or
   `rsvg-convert`), and pack the 16/32/48 px favicon PNGs into `favicon.ico`.
3. Copy the shared favicon files into both apps' `public/` directories.
   Preserve the manifest's `/` `id` and `start_url` fields.
4. Run `bun run check`, then inspect a browser tab and a freshly installed PWA
   on both a rounded and square launcher mask.

Browsers and operating systems cache favicons and installed-app icons
aggressively. An existing install can keep the previous artwork after a normal
refresh; close all tabs and clear site data for browser-icon testing, and
uninstall/reinstall the PWA or home-screen shortcut when verifying launcher
icons.
