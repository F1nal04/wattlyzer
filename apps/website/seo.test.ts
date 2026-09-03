import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const websiteRoot = import.meta.dir;
const robotsTxt = readFileSync(join(websiteRoot, "public/robots.txt"), "utf8");
const astroConfig = readFileSync(join(websiteRoot, "astro.config.mjs"), "utf8");
const layout = readFileSync(
  join(websiteRoot, "src/layouts/Layout.astro"),
  "utf8",
);

describe("website crawler policy", () => {
  it("publishes a robots.txt that allows crawling and points at the production sitemap", () => {
    expect(robotsTxt).toContain("User-agent: *");
    expect(robotsTxt).toMatch(/^\s*Allow:\s*\/\s*$/m);
    expect(robotsTxt).not.toMatch(/^\s*Disallow:\s*\/\s*$/m);
    expect(robotsTxt).toContain("Sitemap: https://wattlyzer.de/sitemap-index.xml");
    expect(robotsTxt).not.toContain("pwa.wattlyzer.de");
  });

  it("generates the sitemap from the production site URL", () => {
    expect(astroConfig).toContain('site: "https://wattlyzer.de"');
    expect(astroConfig).toContain("sitemap()");
  });

  it("emits canonical URLs on the production domain", () => {
    expect(layout).toContain('rel="canonical"');
    expect(layout).toContain("Astro.site");
  });
});
