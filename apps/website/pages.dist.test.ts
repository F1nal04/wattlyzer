import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { IMPRESSUM } from "@wattlyzer/legal";
import * as legal from "./src/i18n/legal";

const dist = join(import.meta.dir, "dist");
const site = "https://wattlyzer.de";

const pages = [
  { locale: "en", file: "index.html", path: "/" },
  { locale: "de", file: "de/index.html", path: "/de/" },
  { locale: "en", file: "legal/index.html", path: "/legal/" },
  { locale: "de", file: "de/legal/index.html", path: "/de/legal/" },
] as const;

describe("published pages", () => {
  for (const { locale, file, path } of pages) {
    const isLegal = path.endsWith("legal/");
    const enPath = path.replace(/^\/de\//, "/");
    const dePath = locale === "de" ? path : `/de${path}`;
    const other = locale === "en" ? "de" : "en";

    it(`${path} has localized SEO metadata`, () => {
      const html = readFileSync(join(dist, file), "utf8");
      expect(html).toContain(`<html lang="${locale}"`);
      expect(html).toMatch(/<title>[^<]+<\/title>/);
      expect(html).toMatch(/<meta name="description" content="[^"]+"/);
      if (isLegal) expect(html).toContain(`<title>${legal[locale]["meta.title"]}</title>`);
      expect(html).toContain(`<link rel="canonical" href="${site}${path}">`);
      expect(html).toContain(`<link rel="alternate" hreflang="en" href="${site}${enPath}">`);
      expect(html).toContain(`<link rel="alternate" hreflang="de" href="${site}${dePath}">`);
      expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="${site}${enPath}">`);
    });

    it(`${path} links the language toggle with the active locale marked`, () => {
      const html = readFileSync(join(dist, file), "utf8");
      const self = locale === "en" ? enPath : dePath;
      const target = locale === "en" ? dePath : enPath;
      expect(html).toContain(`href="${self}" hreflang="${locale}" lang="${locale}" aria-current="page">`);
      expect(html).toContain(`href="${target}" hreflang="${other}" lang="${other}">`);
      expect(html).not.toContain(`hreflang="${other}" lang="${other}" aria-current="page"`);
    });

    if (isLegal) {
      it(`${path} links home and shows the impressum contact`, () => {
        const html = readFileSync(join(dist, file), "utf8");
        expect(html).toContain(`<a href="${locale === "en" ? "/" : "/de/"}" class="back-link">`);
        expect(html).toContain(`href="mailto:${IMPRESSUM.email}"`);
        expect(html).toContain(locale === "de" ? "Impressum" : "Legal");
      });
    } else {
      it(`${path} links the localized legal notice and the source`, () => {
        const html = readFileSync(join(dist, file), "utf8");
        const legalHref = locale === "en" ? "/legal/" : "/de/legal/";
        const wrongHref = locale === "en" ? "/de/legal/" : "/legal/";
        expect(html).toContain(`href="${legalHref}"`);
        expect(html).not.toContain(`href="${wrongHref}"`);
        expect(html).toContain(`https://pwa.wattlyzer.de/install?lang=${locale}`);
        expect(html).not.toContain(`install?lang=${other}`);
        expect(html).toContain('href="https://github.com/F1nal04/wattlyzer"');
      });
    }
  }

  it("keeps the legal titles localized", () => {
    expect(legal.en["meta.title"]).not.toBe(legal.de["meta.title"]);
  });

  it("lists every page in the sitemap", () => {
    const sitemap = readFileSync(join(dist, "sitemap-0.xml"), "utf8");
    for (const { path } of pages) expect(sitemap).toContain(`<loc>${site}${path}</loc>`);
  });
});
