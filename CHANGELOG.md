# Changelog

## [2.0.0](https://github.com/F1nal04/wattlyzer/compare/v1.8.0...v2.0.0) (2026-09-05)


### ⚠ BREAKING CHANGES

* the app no longer runs on Next.js; build output and deployment target changed to TanStack Start (.output server bundle).

### Features

* "Dark mode" — sky palette follows current time ([496d140](https://github.com/F1nal04/wattlyzer/commit/496d14086a1e3aa56c483d283966ca6c7bb9ec5c))
* **astro:** switch to static output, self-host fonts, add view transitions ([b8ecbae](https://github.com/F1nal04/wattlyzer/commit/b8ecbae3603d356d1ccf9701958493b0c26a62ea))
* **cache:** add server-side API proxy routes to reduce upstream requests ([5bdf833](https://github.com/F1nal04/wattlyzer/commit/5bdf83355c872c8bdfd4f0c8666fda38bc472511))
* **dev:** add TanStack Router + Query devtools, dev-only ([6629fbf](https://github.com/F1nal04/wattlyzer/commit/6629fbf8d666032ccae9c4ffdb867176dd1dcfa7))
* **home:** derive sky palette hour via useSkyHour ([65fecfe](https://github.com/F1nal04/wattlyzer/commit/65fecfe6564694a87bf92c42c72a575e01827432))
* **i18n:** add URL-based EN/DE routing with full SEO ([aa25a13](https://github.com/F1nal04/wattlyzer/commit/aa25a13c187f477b3756141289e922bb45dc72b4))
* **icons:** add moon icon ([93e3bd4](https://github.com/F1nal04/wattlyzer/commit/93e3bd40495d97f6a71e69642cd8b06cd1c81e00))
* **infra:** add Node SSR adapter, switch output to server ([2444c05](https://github.com/F1nal04/wattlyzer/commit/2444c052dcaad4a1905bdaf0fa993d090b67aee1))
* **infra:** switch to Netlify SSR adapter ([d13f659](https://github.com/F1nal04/wattlyzer/commit/d13f6590988be488ef6a3658e322a95e826dff54))
* **links:** wire up GitHub links, remove Status and Changelog ([e582516](https://github.com/F1nal04/wattlyzer/commit/e5825166d80e5f260146eb956eff6ad8c2bcdfe1))
* **marketing:** add Wattlyzer marketing site ([d24c74a](https://github.com/F1nal04/wattlyzer/commit/d24c74a1d110bebfff0e4ab885c948a1eb7eaacd))
* **onboarding:** preview dark sky on steps 0-1; add step-2 toggle ([b704605](https://github.com/F1nal04/wattlyzer/commit/b704605f9ab5daeb4f4580ecf060f97d3b571b63))
* **pwa:** add website-aligned i18n and language switching ([#83](https://github.com/F1nal04/wattlyzer/issues/83)) ([99b6409](https://github.com/F1nal04/wattlyzer/commit/99b6409c92cd652f1c516e14cd53e7fbdde00067))
* **pwa:** apply solar and shading edits without a save button ([1571d50](https://github.com/F1nal04/wattlyzer/commit/1571d50544381814f5c99dc7ea963cc2645ba85c))
* **pwa:** block Both and Price when the tariff is off ([31a1061](https://github.com/F1nal04/wattlyzer/commit/31a10613ea61eb9bb0a10ed2aeb31277d09cf741))
* **pwa:** combine morning and evening shading into one edit sheet ([29408d7](https://github.com/F1nal04/wattlyzer/commit/29408d7c7a046f2fe7b430772465886af696da35))
* **pwa:** give morning and evening shading their own edit screens ([5278ac6](https://github.com/F1nal04/wattlyzer/commit/5278ac64888f8db17e5e51d6f55e63a215d63398))
* **pwa:** give morning and evening shading their own edit screens ([1041b1d](https://github.com/F1nal04/wattlyzer/commit/1041b1dc3509fa316e90229c92baa9bd393037ec))
* **pwa:** show disabled solar clearly and block solar-only ([9980ed8](https://github.com/F1nal04/wattlyzer/commit/9980ed8a446d4adfc64492b092abeef3941da9b8))
* **pwa:** show disabled solar clearly and block solar-only ([81e6121](https://github.com/F1nal04/wattlyzer/commit/81e61216add1cf900bbad30d8606450a46df5565))
* **pwa:** warn when solar and dynamic tariff are both off ([c38d94b](https://github.com/F1nal04/wattlyzer/commit/c38d94b132e5586f04715664ec18ca9598527152))
* **pwa:** warn when solar and dynamic tariff are both off ([abf4024](https://github.com/F1nal04/wattlyzer/commit/abf40241da3254744be43f281efccb0b6e44bc51))
* redesign app with Sky UI and migrate from Next.js to TanStack Start ([af05de1](https://github.com/F1nal04/wattlyzer/commit/af05de1dfac504e94d1edeecb4f6a736045ba42c))
* **router:** add sky-styled 404 as defaultNotFoundComponent ([49627c5](https://github.com/F1nal04/wattlyzer/commit/49627c523d08c1d785c73b707d43dbab155338d5))
* **settings:** add currentTimeSky (dark mode) setting ([cad4ec8](https://github.com/F1nal04/wattlyzer/commit/cad4ec8764bdd49dcebe05c4f9d31c8c55ce78e7))
* **settings:** derive theme via useSkyHour; add Dark mode toggle ([b04f795](https://github.com/F1nal04/wattlyzer/commit/b04f795f39697da5b3b96650e66d0560d4f98a0e))
* **settings:** remove install links from the More group ([cebe1a7](https://github.com/F1nal04/wattlyzer/commit/cebe1a730cb927647c4548dfc39cb96b48cf6565))
* **sky:** add useSkyHour hook + pickSkyHour decision logic ([15ab6e3](https://github.com/F1nal04/wattlyzer/commit/15ab6e35511792946e7611596de86a084ad1ac91))
* **sky:** brand pages follow current time when dark mode on ([77539b8](https://github.com/F1nal04/wattlyzer/commit/77539b8af64563ea5e5bbaa417979ec7926efdc8))
* **sky:** redraw clouds as smooth SVG shapes ([5876bad](https://github.com/F1nal04/wattlyzer/commit/5876bad77f9768d95fd9ae7f72b09d624967b5d4))
* **sky:** redraw scale, euro, and settings icons ([0b028f6](https://github.com/F1nal04/wattlyzer/commit/0b028f641e0894b3aef14a331d1106956b6fcd05))
* **sky:** tap the clock to toggle a countdown to the best time ([a08ec00](https://github.com/F1nal04/wattlyzer/commit/a08ec007837d770cba8e836a98281949c93ab595))
* **ui:** remove phone mockup from hero section ([a110803](https://github.com/F1nal04/wattlyzer/commit/a110803fddbadec9c1c87e87c2da1b9a489ca9a3))
* **weather:** drive the sky hero from real DWD cloud cover via BrightSky ([28ba3ae](https://github.com/F1nal04/wattlyzer/commit/28ba3ae6b9e30a827191a671033452847492c3fb))
* **weather:** rain, snow, and fog sky visuals ([f758daa](https://github.com/F1nal04/wattlyzer/commit/f758daa0c8002d1926ccf2e3e42dd7dc0c38419d))
* **weather:** rain, snow, and fog sky visuals from DWD condition ([978c409](https://github.com/F1nal04/wattlyzer/commit/978c409cf7af8a49e80b5b898d29b0bb4740938a))
* **website:** link install buttons to the PWA in the selected language ([#91](https://github.com/F1nal04/wattlyzer/issues/91)) ([8e7536e](https://github.com/F1nal04/wattlyzer/commit/8e7536eadac498daab6404e6b0891f9dac2febdc))


### Bug Fixes

* **animation:** clear sky interval before ClientRouter page swap ([63638f8](https://github.com/F1nal04/wattlyzer/commit/63638f8ef27ba4d00c7e9cd3b090d6afad32ec65))
* **animation:** wrap page scripts in astro:page-load for ClientRouter compat ([de9ba52](https://github.com/F1nal04/wattlyzer/commit/de9ba522195f8b1e1fa12bc6c7fa3270512a9fb5))
* avoid Safari backdrop-filter issues in settings ([6c0e52e](https://github.com/F1nal04/wattlyzer/commit/6c0e52e9033719642e816adf887585d0a399c3af))
* **cache:** pass revalidateTag profile for Next.js 16 ([3c113d0](https://github.com/F1nal04/wattlyzer/commit/3c113d02fb78d28adb8be26b2f19f801a292a361))
* **copy:** generalise FAQ tariff and solar forecast answers ([86786ac](https://github.com/F1nal04/wattlyzer/commit/86786acdc7a3a2ad8b594006ed51cef91ebc8caa))
* **copy:** remove 'works offline' tag, change city to Berlin ([b29425e](https://github.com/F1nal04/wattlyzer/commit/b29425ea1841a11e0039520616679948c40c6975))
* **copy:** remove offline references from privacy section ([c482ffe](https://github.com/F1nal04/wattlyzer/commit/c482ffeccfb001a8a0ce2db59d354fcf4b245acb))
* force Safari glass surfaces to repaint on theme changes ([497a1bf](https://github.com/F1nal04/wattlyzer/commit/497a1bf243f6d41bf6a9cf186fd1d8028cf2984f))
* **home:** pin the pre-mount theme hour to avoid a frozen background ([59167e7](https://github.com/F1nal04/wattlyzer/commit/59167e76ad5504be8cd9f52fea7315a7f45e8cdf))
* **home:** say 'Best time tomorrow' when the slot is on the next day ([c21b729](https://github.com/F1nal04/wattlyzer/commit/c21b7294f05fd131497c5957abff1de4fe675745))
* match settings sky to the recommended slot ([2f6b838](https://github.com/F1nal04/wattlyzer/commit/2f6b838d796fee89a30a9fb4ee36de1964aef120))
* paint Safari glass surfaces on first paint ([ea3cf97](https://github.com/F1nal04/wattlyzer/commit/ea3cf97548b13ee6394adc6e4911e318b3764136))
* preserve mounted sky state across route changes ([1987528](https://github.com/F1nal04/wattlyzer/commit/198752874142cc326a35df3156f9ae5732df7142))
* prevent Safari backdrop caching during onboarding ([63bc963](https://github.com/F1nal04/wattlyzer/commit/63bc9630788020c728101c7e0e71c12eb83dfe3b))
* **pwa:** defer solar fetch and scoring until returning home ([6642c9b](https://github.com/F1nal04/wattlyzer/commit/6642c9b1c2208ce3f4bf684f6d600fc7a24d0051))
* **pwa:** route install visitors to the appropriate device guide ([#90](https://github.com/F1nal04/wattlyzer/issues/90)) ([072e661](https://github.com/F1nal04/wattlyzer/commit/072e66140604f8f91df0cee6650630dc8a8393ff))
* **pwa:** set start_url so installs from any page launch the app root ([6ced0f8](https://github.com/F1nal04/wattlyzer/commit/6ced0f88dacd22156984465de7bd47ed539bde19))
* **pwa:** stop price-only mode from switching the solar panels off ([#85](https://github.com/F1nal04/wattlyzer/issues/85)) ([4ef88df](https://github.com/F1nal04/wattlyzer/commit/4ef88dfda18d5f9fdd2c7f201cd14ca9082efbfb))
* **pwa:** update scheduling mode when solar is turned off ([2050284](https://github.com/F1nal04/wattlyzer/commit/2050284aaf833fa16085de6e9b9d45948008eaf8))
* **pwa:** update scheduling mode when solar is turned off ([cc39eaf](https://github.com/F1nal04/wattlyzer/commit/cc39eaf990e73e1123cb352f3004f0d671e79e2e))
* resolve bugs found in scheduling, settings, and UI review ([b3a6a11](https://github.com/F1nal04/wattlyzer/commit/b3a6a1135d045838bc33aece13c21858211a312b))
* **rows:** wrap ObSwitchRow/ObCard text instead of truncating ([d94d80f](https://github.com/F1nal04/wattlyzer/commit/d94d80f934a974adf7c7164aacb0f4b51a80ad46))
* Safari glass first paint and settings sky hour ([74da205](https://github.com/F1nal04/wattlyzer/commit/74da2058332954e9eba1a6733a5d2f8b1615fd81))
* **settings:** wrap toggle-row detail text so it stops clipping under the switch ([3115841](https://github.com/F1nal04/wattlyzer/commit/3115841b5f1eeee9010f8f4f0c454976014af496))
* **sky:** paint frosted glass boxes on iOS Safari in scroll views ([3366f68](https://github.com/F1nal04/wattlyzer/commit/3366f6835fc93a9e44d5bed45019c2b3fb08daa0))
* **sky:** paint frosted glass boxes on iOS Safari in scroll views ([370ca08](https://github.com/F1nal04/wattlyzer/commit/370ca08a2a62ac8ef894659b1b6b5870823adbc2))
* **ui:** wrap row text so labels are never occluded by trailing controls on mobile ([92b9673](https://github.com/F1nal04/wattlyzer/commit/92b9673cebfef8221becc7170c65fe5e3726d76c))
* **website:** add animated SVG clouds to website hero ([#82](https://github.com/F1nal04/wattlyzer/issues/82)) ([14da06e](https://github.com/F1nal04/wattlyzer/commit/14da06e1c221a2094daa6c55ab23c42fa1f774e5))


### Performance Improvements

* enable React Compiler and make renders memoizable ([61da6ae](https://github.com/F1nal04/wattlyzer/commit/61da6ae0a93fba720defb6440d1254d897f2bcae))


### Reverts

* **settings:** clear cache button only clears localStorage ([f48fc8f](https://github.com/F1nal04/wattlyzer/commit/f48fc8fd45319676081699dacced46b2af0926a6))

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
