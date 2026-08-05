# Wattlyzer website

Static Astro marketing site for Wattlyzer, deployed to [wattlyzer.de](https://wattlyzer.de). The installable PWA lives at [pwa.wattlyzer.de](https://pwa.wattlyzer.de).

Run commands from the monorepo root:

```bash
bun run dev:website
bunx nx typecheck website
bunx nx build website
```

English routes are unprefixed and German routes use `/de/`. The site uses plain CSS, Astro's build-time font support, and the shared `@wattlyzer/theme` package.
