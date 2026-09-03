import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const websiteRoot = import.meta.dir;
const css = readFileSync(join(websiteRoot, "src/styles/index.css"), "utf8");
const en = readFileSync(join(websiteRoot, "src/pages/index.astro"), "utf8");
const de = readFileSync(join(websiteRoot, "src/pages/de/index.astro"), "utf8");

function heroSky(page: string) {
  const start = page.indexOf("hero-sky");
  const end = page.indexOf("hero-content", start);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return page.slice(start, end);
}

describe("website hero clouds", () => {
  it("defines a looping horizontal drift animation", () => {
    expect(css).toMatch(/@keyframes\s+[\w-]*cloud[\w-]*drift/i);
    expect(css).toMatch(/translateX\(/);
  });

  it("applies staggered drift to each hero cloud layer", () => {
    for (const layer of [".cloud-1", ".cloud-2", ".cloud-3"]) {
      const blockStart = css.indexOf(layer);
      expect(blockStart).toBeGreaterThan(-1);
      const block = css.slice(blockStart, blockStart + 280);
      expect(block).toMatch(/animation:/);
      expect(block).toMatch(/infinite/);
    }
  });

  it("keeps a static cloud composition when the user prefers reduced motion", () => {
    expect(css).toMatch(
      /prefers-reduced-motion:\s*reduce[\s\S]*?\.hero-cloud[\s\S]*?animation:\s*none/,
    );
    expect(en).toContain("prefers-reduced-motion");
    expect(de).toContain("prefers-reduced-motion");
  });

  it("draws clouds as a continuous SVG silhouette on both locales", () => {
    const componentPath = join(
      websiteRoot,
      "src/components/HeroClouds.astro",
    );
    expect(existsSync(componentPath)).toBe(true);
    const clouds = readFileSync(componentPath, "utf8");
    expect(clouds).toContain("<svg");
    expect(clouds).toContain("<path");
    expect(clouds).toContain("M46 96");
    expect(heroSky(en)).toContain("HeroClouds");
    expect(heroSky(de)).toContain("HeroClouds");
    expect(heroSky(en)).not.toContain('id="hc1"');
    expect(heroSky(de)).not.toContain('id="hc1"');
  });
});
