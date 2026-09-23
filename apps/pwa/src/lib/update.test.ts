import { describe, expect, test } from "bun:test";
import { isNewerBuild } from "./update";

describe("isNewerBuild", () => {
  test("same version is not an update", () => {
    expect(isNewerBuild("1.8.0", "1.8.0")).toBe(false);
  });

  test("a different deployed version is an update", () => {
    expect(isNewerBuild("1.8.0", "1.9.0")).toBe(true);
  });

  test("missing, empty, or non-string versions are ignored", () => {
    expect(isNewerBuild("1.8.0", undefined)).toBe(false);
    expect(isNewerBuild("1.8.0", "")).toBe(false);
    expect(isNewerBuild("1.8.0", 190)).toBe(false);
  });
});
