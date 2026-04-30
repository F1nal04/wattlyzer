# Changelog

## [1.9.0](https://github.com/F1nal04/wattlyzer-app/compare/v1.8.0...v1.9.0) (2026-04-30)


### Features

* **cache:** add server-side API proxy routes to reduce upstream requests ([5bdf833](https://github.com/F1nal04/wattlyzer-app/commit/5bdf83355c872c8bdfd4f0c8666fda38bc472511))


### Bug Fixes

* **cache:** pass revalidateTag profile for Next.js 16 ([3c113d0](https://github.com/F1nal04/wattlyzer-app/commit/3c113d02fb78d28adb8be26b2f19f801a292a361))


### Reverts

* **settings:** clear cache button only clears localStorage ([f48fc8f](https://github.com/F1nal04/wattlyzer-app/commit/f48fc8fd45319676081699dacced46b2af0926a6))

## [1.8.0](https://github.com/F1nal04/wattlyzer-app/compare/v1.7.4...v1.8.0) (2026-04-28)

### Features

- **seo:** add robots.txt, sitemap, and homepage-only indexing ([8296410](https://github.com/F1nal04/wattlyzer-app/commit/8296410d1c16ac8cd4170ea9160f301e86f98392))
- **ui:** add custom not-found page ([c977ebd](https://github.com/F1nal04/wattlyzer-app/commit/c977ebd1dd5bc2a97b980a5578a1eabc650bc9a1))
- **ui:** enhance UI with icons and improve layout across multiple pages ([71cba36](https://github.com/F1nal04/wattlyzer-app/commit/71cba3697f87c7cb0bf67fd8a3820621775e17c7))

### Bug Fixes

- **ui:** improve layout and accessibility in SchedulingPanel and FooterLinks ([03e16a8](https://github.com/F1nal04/wattlyzer-app/commit/03e16a84f586b7aeda7b48ddbacf39d329f2e76e))

## [1.7.4](https://github.com/F1nal04/wattlyzer-app/compare/v1.7.3...v1.7.4) (2026-03-25)

### Bug Fixes

- **debug:** ref link allows to reach debug page from home ([80467be](https://github.com/F1nal04/wattlyzer-app/commit/80467be3737ebb35b72ff64c4f8e6e457d803c6a))

## [1.7.3](https://github.com/F1nal04/wattlyzer-app/compare/v1.7.2...v1.7.3) (2026-03-25)

### Bug Fixes

- **schedule:** update handling of missing market prices in schedule calculation ([4210631](https://github.com/F1nal04/wattlyzer-app/commit/4210631d46e139df9e7daa43a30392285a8c4406))

## [1.7.2](https://github.com/F1nal04/wattlyzer-app/compare/v1.7.1...v1.7.2) (2026-03-24)

### Bug Fixes

- improve missing price handling and market data checks ([a1891c3](https://github.com/F1nal04/wattlyzer-app/commit/a1891c3f6a1aff32157681e8e9e1deee5bf83f85))

## [1.7.1](https://github.com/F1nal04/wattlyzer-app/compare/v1.7.0...v1.7.1) (2026-03-23)

### Bug Fixes

- market data sufficiency checks for partial hours ([72ef495](https://github.com/F1nal04/wattlyzer-app/commit/72ef495693a5df8f091552bc923a12271b559785))

## [1.7.0](https://github.com/F1nal04/wattlyzer-app/compare/v1.6.0...v1.7.0) (2026-03-20)

### Features

- add UTC timezone support and enhance scheduling tests ([cce3aa8](https://github.com/F1nal04/wattlyzer-app/commit/cce3aa89145adb004bac9d371f6be22e654b2935))
- integrate Radix UI components and enhance debug page ([705d285](https://github.com/F1nal04/wattlyzer-app/commit/705d285343b3075904ac1bf66f051bd0261a0ac0))
- integrate Vitest for testing and enhance scheduling logic ([b71f253](https://github.com/F1nal04/wattlyzer-app/commit/b71f2539a1548e3c271c14acb4f2574fbf762b54))

## [1.6.0](https://github.com/F1nal04/wattlyzer-app/compare/v1.5.4...v1.6.0) (2026-03-19)

### Features

- add commit SHA to environment and debug page ([8a4ec7b](https://github.com/F1nal04/wattlyzer-app/commit/8a4ec7b601c10a0736f26fa36ab49c2a3fd75323))
- add evening shading feature and update solar requirement settings ([99ffb66](https://github.com/F1nal04/wattlyzer-app/commit/99ffb66b656837100c1c7856ef4df33226ca7160))
- add yellow accent to StatusPanel and improve scheduling feedback ([30d7de2](https://github.com/F1nal04/wattlyzer-app/commit/30d7de230c573968b8715f2ead7e0407a730978c))
- enhance scheduling logic and UI for best slot modes ([3582cc9](https://github.com/F1nal04/wattlyzer-app/commit/3582cc9c4c73d431a105588afa09a07417160e92))
- enhance settings page with new UI components and azimut functionality ([d5090dd](https://github.com/F1nal04/wattlyzer-app/commit/d5090ddf8a7be6505f2efe4b08e43a6b4d3fe633))
- enhance Tabs component with orientation and variant support ([53aeb93](https://github.com/F1nal04/wattlyzer-app/commit/53aeb93a770d163d5dc575c44ef3137dc231642f))
- enhance UI components across multiple pages ([9b07a0c](https://github.com/F1nal04/wattlyzer-app/commit/9b07a0c4e45970f1d9d719a1086d5285c91a2ca5))
- integrate Tabs component for enhanced scheduling options ([d4d9005](https://github.com/F1nal04/wattlyzer-app/commit/d4d90050e89536a3a403e331a889345a880ff69f))
