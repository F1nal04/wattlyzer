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

  it("keeps both routes of each page thin over one shared component", () => {
    // Hand-duplicated pages drifted apart before (two legal notices with
    // different contact addresses, a landing page with stale copy).
    for (const [page, component] of [
      ["legal.astro", "LegalPage"],
      ["index.astro", "LandingPage"],
    ]) {
      for (const dir of ["src/pages/", "src/pages/de/"]) {
        const source = read(dir + page);
        expect(source).toMatch(
          new RegExp(`import ${component} from '[./]+/components/${component}\\.astro'`),
        );
        expect(source).toContain(`<${component} />`);
        expect(source).not.toContain("<Layout");
      }
    }
  });
});

describe("locale selection", () => {
  it("derives the locale from the route and falls back to the shared default", () => {
    for (const file of [
      "src/layouts/Layout.astro",
      "src/components/LanguageToggle.astro",
      "src/components/LegalPage.astro",
      "src/components/LandingPage.astro",
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
  it("derives the landing page's install and legal links from the locale", () => {
    // The built pages are checked in pages.dist.test.ts; here only that no
    // language is hard-coded into the shared component.
    const source = read("src/components/LandingPage.astro");
    expect(source).toContain("install?lang=${locale}");
    expect(source).toContain("getRelativeLocaleUrl(locale, '/legal/')");
    expect(source).not.toContain("?lang=en");
    expect(source).not.toContain("?lang=de");
    expect(source).not.toContain('"/legal/"');
    expect(source).not.toContain('"/de/legal/"');
  });
});
