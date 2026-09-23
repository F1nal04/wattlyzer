# Wattlyzer website

Static Astro marketing site for Wattlyzer, deployed to [wattlyzer.de](https://wattlyzer.de). The installable PWA lives at [pwa.wattlyzer.de](https://pwa.wattlyzer.de).

Run commands from the monorepo root:

```bash
bun run dev:website
bunx nx typecheck website
bunx nx test website        # static checks on source: routes, locale fallback, i18n catalogs, crawler policy
bunx nx build website
bunx nx verify-seo website  # builds first, then smoke-tests dist: metadata, hreflang, nav links, sitemap
```

Tests use `bun test` and never touch the network. `*.test.ts` files inspect the source tree; `*.dist.test.ts` files inspect the built `dist` output and therefore run through `verify-seo`, which depends on `build`. Both targets are part of `bun run check` and `bun run affected`. Run a single file with `TZ=UTC bun test apps/website/routes.test.ts` from the monorepo root.

English routes are unprefixed and German routes use `/de/`. The site uses plain CSS, Astro's build-time font support, and the shared `@wattlyzer/theme` package.
