import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pwaRoot = join(import.meta.dir, "..");

function readExisting(relativePath: string) {
  const path = join(pwaRoot, relativePath);
  expect(existsSync(path)).toBe(true);
  return readFileSync(path, "utf8");
}

describe("PWA crawler policy", () => {
  it("publishes a robots.txt that disallows all crawling", () => {
    const robotsTxt = readExisting("public/robots.txt");
    expect(robotsTxt).toContain("User-agent: *");
    expect(robotsTxt).toContain("Disallow: /");
    expect(robotsTxt).not.toMatch(/^\s*Allow:\s*\/\s*$/m);
    expect(robotsTxt).not.toMatch(/Sitemap:/i);
    expect(robotsTxt).not.toContain("wattlyzer.de");
  });

  it("emits a noindex robots meta tag from the document head", () => {
    const rootRoute = readExisting("src/routes/__root.tsx");
    expect(rootRoute).toContain('name: "robots"');
    expect(rootRoute).toMatch(/content:\s*"noindex(?:,\s*nofollow)?"/);
  });

  it("sends X-Robots-Tag noindex on every PWA response", () => {
    const netlifyToml = readExisting("netlify.toml");
    expect(netlifyToml).toContain('for = "/*"');
    expect(netlifyToml).toMatch(/X-Robots-Tag\s*=\s*"noindex(?:,\s*nofollow)?"/);
  });
});
