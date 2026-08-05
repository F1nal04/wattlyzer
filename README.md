[![Version](https://img.shields.io/github/package-json/v/f1nal04/wattlyzer?style=flat-square&color=yellow)](https://github.com/F1nal04/wattlyzer/releases)
[![License](https://img.shields.io/github/license/f1nal04/wattlyzer?style=flat-square&color=yellow)](LICENSE)

# Wattlyzer

Wattlyzer finds the best time to run energy-intensive appliances from a roof's solar forecast and German day-ahead electricity prices. This repository contains the installable PWA, its marketing website, and the platform-neutral packages shared between them.

## Workspace

```text
apps/
  pwa/          TanStack Start PWA deployed to pwa.wattlyzer.de
  website/      Astro marketing site deployed to wattlyzer.de
packages/
  core/         Scheduling, market coverage, and weather domain logic
  api-client/   forecast.solar, aWATTar, and BrightSky clients
  theme/        Shared sky and brand tokens
```

The workspace uses Bun for package management and tests, and Nx for the project graph, task orchestration, affected checks, and local caching. The shared packages are private source packages; they are not published to npm.

## Development

Requires Node 22.12 or newer and Bun 1.3.14 or newer.

```bash
bun install
bun dev                 # PWA on port 3000
bun run dev:website     # Astro site on port 4321
bun run check           # lint, typecheck, test, and build every project
bun run affected        # run checks only for projects affected by Git changes
```

Run a single project or target through Nx:

```bash
bunx nx test core
bunx nx build pwa
bunx nx build website
```

Tests use `bun:test`, not Vitest, and domain tests run with `TZ=UTC`.

## Deployment

Both sites deploy independently from this repository on Netlify. Configure the Netlify package directories as `apps/pwa` and `apps/website`, leave the base directory unset so dependency installation runs at the workspace root, and use each application's committed `netlify.toml`.

## License

Released under [Apache 2.0](LICENSE) by [@F1nal04](https://github.com/F1nal04).
