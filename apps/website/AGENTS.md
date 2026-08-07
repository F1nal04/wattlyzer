## Website-specific guidance

- Run workspace commands from the repository root: `bun run dev:website`, `bunx nx typecheck website`, and `bunx nx build website`.
- Keep this application static Astro with plain CSS and no client-side framework integration.
- English lives at `/`; German lives at `/de/`. Add and update both language routes together.
- Fonts are fetched at build time through Astro and exposed as CSS variables.
- Reuse `skyTheme` and brand tokens from `@wattlyzer/theme`; do not duplicate palette logic in pages.
- Deployment configuration lives in `apps/website/netlify.toml`; Netlify's package directory must be `apps/website` with the repository root as the base.
