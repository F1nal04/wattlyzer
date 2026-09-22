# Wattlyzer brand icons

The browser and installed-app icon set uses the purple and yellow Wattlyzer
clock, energy curve, and lightning artwork. The adaptive SVG is the reusable
source asset and lives at `apps/pwa/public/favicon.svg`; the website copy at
`apps/website/public/favicon.svg` must stay byte-for-byte identical.

## Published variants

| Asset | Published by | Purpose |
| --- | --- | --- |
| `favicon.svg` | PWA and website | Adaptive light/dark browser icon and source artwork |
| `favicon.ico` | PWA and website | 16, 32, and 48 px browser fallback |
| `favicon-96x96.png` | PWA and website | 96 px PNG browser fallback |
| `apple-touch-icon.png` | PWA | 180 px iOS home-screen icon |
| `web-app-manifest-192x192.png` | PWA | 192 px maskable launcher icon |
| `web-app-manifest-512x512.png` | PWA | 512 px maskable launcher icon |

The launcher images include the required padding around the artwork and are
declared `maskable` in `apps/pwa/public/site.webmanifest`. Do not crop or scale
the artwork to the image edges.

## Updating the set

1. Open the current `favicon.svg` in
   [RealFaviconGenerator](https://realfavicongenerator.net/) and replace its
   artwork with the approved source design.
2. Use `#59326c` for the theme and background colors. Keep the launcher
   artwork inside the maskable safe area.
3. Generate SVG, ICO, 96 px PNG, 180 px Apple touch, and 192/512 px maskable
   PNG variants with the filenames in the table above.
4. Replace both apps' shared favicon files and the PWA-only files. Preserve
   the manifest's `/` `id` and `start_url` fields.
5. Run `bun run check`, then inspect a browser tab and a freshly installed PWA
   on both a rounded and square launcher mask.

Browsers and operating systems cache favicons and installed-app icons
aggressively. An existing install can keep the previous artwork after a normal
refresh; close all tabs and clear site data for browser-icon testing, and
uninstall/reinstall the PWA or home-screen shortcut when verifying launcher
icons.

The repository audit for issue #92 found no other image-based Wattlyzer mark.
The website navigation/footer wordmarks are styled text, while PWA interface
icons and the website background illustration are product UI artwork rather
than brand-icon copies.
