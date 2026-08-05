# wattlyzer-web

Marketing website for Wattlyzer — a PWA that reads the sun, the spot price, and your roof, then tells you the one best window today to run your dishwasher, heat pump, or wall box.

Live at **[wattlyzer.de](https://wattlyzer.de)**. The PWA itself lives at [pwa.wattlyzer.de](https://pwa.wattlyzer.de).

Built with Astro 6, plain CSS, and no client-side framework. EN/DE bilingual with URL-based routing, animated sky hero, and static output.

## Stack

- [Astro 6](https://astro.build) — static output, file-based routing, view transitions
- Fraunces · DM Sans · JetBrains Mono — self-hosted via Astro's font API (no Google Fonts request at runtime)
- `@astrojs/sitemap` — auto-generated sitemap with hreflang

## Development

Requires Node >= 22.12.0 and [bun](https://bun.sh).

```bash
bun install       # install dependencies
bun dev           # dev server at localhost:4321
bun build         # production build → dist/
bun preview       # preview production build locally
```

## i18n

English at `/`, German at `/de/`. Each language is a separate page file — no runtime toggle. Adding a new page requires both `src/pages/<slug>.astro` and `src/pages/de/<slug>.astro`.

## Deployment

Static build (`dist/`) deployable to any CDN. No server adapter required.
