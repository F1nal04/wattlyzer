import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const distRobotsPath = join(import.meta.dir, "dist/client/robots.txt");

describe("PWA build crawler artifacts", () => {
  it("copies a disallow-all robots.txt into the published client output", () => {
    expect(existsSync(distRobotsPath)).toBe(true);
    const distRobots = readFileSync(distRobotsPath, "utf8");
    expect(distRobots).toContain("User-agent: *");
    expect(distRobots).toContain("Disallow: /");
    expect(distRobots).not.toMatch(/Sitemap:/i);
  });
});
