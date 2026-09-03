import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_LOCALE, LOCALES } from "@wattlyzer/i18n";

const websiteRoot = import.meta.dir;
const astroConfig = readFileSync(
  join(websiteRoot, "astro.config.mjs"),
  "utf8",
);
const layout = readFileSync(
  join(websiteRoot, "src/layouts/Layout.astro"),
  "utf8",
);

// `astro.config.mjs` cannot import the shared package (Astro reads it before
// workspace resolution), so this guards the two from drifting apart.
describe("website locale model", () => {
  it("routes exactly the locales the shared package defines", () => {
    const declared = astroConfig.match(/locales:\s*\[([^\]]*)\]/)?.[1];
    expect(declared).toBeDefined();
    const parsed = [...declared!.matchAll(/"([^"]+)"/g)].map(([, v]) => v);
    expect(parsed).toEqual([...LOCALES]);
  });

  it("uses the shared default locale as the unprefixed one", () => {
    expect(astroConfig).toContain(`defaultLocale: "${DEFAULT_LOCALE}"`);
    expect(astroConfig).toContain("prefixDefaultLocale: false");
  });

  it("derives the layout's locale handling from the shared package", () => {
    expect(layout).toContain('from \'@wattlyzer/i18n\'');
    expect(layout).toContain("isLocale(Astro.currentLocale)");
  });
});
