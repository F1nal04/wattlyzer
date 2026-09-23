import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const websiteRoot = import.meta.dir;
const read = (path: string) => readFileSync(join(websiteRoot, path), "utf8");
const pages = readdirSync(join(websiteRoot, "src/pages"), { recursive: true })
  .map(String)
  .filter((page) => page.endsWith(".astro"));
const english = pages.filter((page) => !page.startsWith("de/")).sort();
const german = pages
  .filter((page) => page.startsWith("de/"))
  .map((page) => page.slice(3))
  .sort();

describe("route structure", () => {
  it("gives every English page a German twin and vice versa", () => {
    expect(english.filter((page) => !german.includes(page))).toEqual([]);
    expect(german.filter((page) => !english.includes(page))).toEqual([]);
  });

  it("ships exactly the pages this test knows about", () => {
    // A new page should force someone to revisit the locale coverage here.
    expect(english).toEqual(["index.astro", "legal.astro"]);
  });

  it("keeps both legal routes thin over the shared LegalPage", () => {
    // The impressum comes from @wattlyzer/legal; hand-duplicated legal
    // pages drifted apart before.
    for (const page of ["src/pages/legal.astro", "src/pages/de/legal.astro"]) {
      const source = read(page);
      expect(source).toMatch(/import LegalPage from '[./]+\/components\/LegalPage\.astro'/);
      expect(source).toContain("<LegalPage />");
      expect(source).not.toContain("<Layout");
    }
  });
});

describe("locale selection", () => {
  it("derives the locale from the route and falls back to the shared default", () => {
    for (const file of [
      "src/layouts/Layout.astro",
      "src/components/LanguageToggle.astro",
      "src/components/LegalPage.astro",
    ]) {
      const source = read(file);
      expect(source).toMatch(
        /import \{[^}]*\bDEFAULT_LOCALE\b[^}]*\} from '@wattlyzer\/i18n'/,
      );
      expect(source).toMatch(/import \{[^}]*\bisLocale\b[^}]*\} from '@wattlyzer\/i18n'/);
      expect(source).toContain(
        "isLocale(Astro.currentLocale) ? Astro.currentLocale : DEFAULT_LOCALE",
      );
    }
  });

  it("never detects the locale from the browser", () => {
    // The URL decides the locale, so each language stays static and crawlable.
    const offenders = readdirSync(join(websiteRoot, "src"), { recursive: true })
      .map(String)
      .filter((file) => /\.(astro|ts|js|mjs)$/.test(file))
      .filter((file) =>
        /navigator\.language|Accept-Language/i.test(read(join("src", file))),
      );
    expect(offenders).toEqual([]);
  });
});

describe("localized links", () => {
  it("keeps the English landing page on English targets", () => {
    const source = read("src/pages/index.astro");
    expect(source).toContain('href="/legal/"');
    expect(source).toContain("https://pwa.wattlyzer.de/install?lang=en");
    expect(source).not.toContain("/de/legal/");
    expect(source).not.toContain("?lang=de");
  });

  it("keeps the German landing page on German targets", () => {
    const source = read("src/pages/de/index.astro");
    expect(source).toContain('href="/de/legal/"');
    expect(source).toContain("https://pwa.wattlyzer.de/install?lang=de");
    expect(source).not.toContain('href="/legal/"');
    expect(source).not.toContain("?lang=en");
  });
});
