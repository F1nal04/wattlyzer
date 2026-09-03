import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(import.meta.dir, "dist");

describe("website build crawler artifacts", () => {
  it("publishes the allow-all robots.txt with the production sitemap", () => {
    const distRobotsPath = join(dist, "robots.txt");
    expect(existsSync(distRobotsPath)).toBe(true);
    const distRobots = readFileSync(distRobotsPath, "utf8");
    expect(distRobots).toContain("User-agent: *");
    expect(distRobots).toMatch(/^\s*Allow:\s*\/\s*$/m);
    expect(distRobots).toContain(
      "Sitemap: https://wattlyzer.de/sitemap-index.xml",
    );
  });

  it("emits a sitemap index for the production site", () => {
    const sitemapIndex = join(dist, "sitemap-index.xml");
    expect(existsSync(sitemapIndex)).toBe(true);
    expect(readFileSync(sitemapIndex, "utf8")).toContain(
      "https://wattlyzer.de/",
    );
  });
});
