import { describe, expect, it } from "bun:test";
import { skyTheme } from "./sky-theme";

describe("skyTheme", () => {
  it("keeps the established palette cutoffs", () => {
    expect(skyTheme(4).name).toBe("night");
    expect(skyTheme(5).name).toBe("dawn");
    expect(skyTheme(8).name).toBe("midday");
    expect(skyTheme(16).name).toBe("sunset");
    expect(skyTheme(19).name).toBe("dusk");
  });

  it("keeps the shared midday and night gradients", () => {
    expect(skyTheme(12).sky).toEqual(["#bde4ff", "#fef0c7", "#fcd28a"]);
    expect(skyTheme(2).sky).toEqual(["#0f1430", "#1d2148", "#3a2c52"]);
  });
});
