import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_LOCALE, LOCALES, placeholdersIn } from "@wattlyzer/i18n";
import { de as legalDe, en as legalEn } from "./src/i18n/legal";

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

describe("language toggle", () => {
  const pages = [
    "src/pages/index.astro",
    "src/pages/de/index.astro",
    "src/pages/legal.astro",
    "src/pages/de/legal.astro",
  ];

  it("is never hand-written in a page", () => {
    // The toggle used to be copy-pasted into eight places across four
    // pages, each with its own hard-coded active locale.
    const offenders = pages.filter((page) =>
      /lang-btn|footer-lang-btn/.test(
        readFileSync(join(websiteRoot, page), "utf8"),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("derives its options from the shared package", () => {
    const toggle = readFileSync(
      join(websiteRoot, "src/components/LanguageToggle.astro"),
      "utf8",
    );
    expect(toggle).toContain("localeOptions");
    expect(toggle).toContain("@wattlyzer/i18n");
  });

  it("keeps the class names the stylesheets target", () => {
    const toggle = readFileSync(
      join(websiteRoot, "src/components/LanguageToggle.astro"),
      "utf8",
    );
    for (const className of [
      "lang-toggle",
      "lang-toggle-mob",
      "footer-lang",
      "lang-btn",
      "footer-lang-btn",
      "lang-sep",
    ]) {
      expect(toggle).toContain(className);
    }
  });
});

describe("legal catalog", () => {
  it("translates every English key into German", () => {
    const missing = (Object.keys(legalEn) as (keyof typeof legalEn)[]).filter(
      (key) => !(key in legalDe),
    );
    expect(missing).toEqual([]);
  });

  it("has no German key that English does not define", () => {
    expect(
      Object.keys(legalDe).filter((key) => !(key in legalEn)),
    ).toEqual([]);
  });

  it("keeps the same placeholders in both locales", () => {
    const mismatched = (
      Object.keys(legalEn) as (keyof typeof legalEn)[]
    ).filter((key) => {
      const source = placeholdersIn(legalEn[key]);
      const target = placeholdersIn(legalDe[key]);
      return (
        source.size !== target.size ||
        [...source].some((name) => !target.has(name))
      );
    });
    expect(mismatched).toEqual([]);
  });

  it("actually translates the headline, which used to render in English", () => {
    // Regression: /de/legal/ shipped `<h1>Legal <em>notice.</em></h1>`
    // because the German page was a hand-maintained copy.
    expect(legalDe.title).not.toBe(legalEn.title);
    expect(legalDe.titleEm).toBe("Impressum.");
  });
});
