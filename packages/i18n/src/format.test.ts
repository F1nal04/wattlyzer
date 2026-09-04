import { describe, expect, it } from "bun:test";
import { formatDecimal, formatInteger } from "./format";

describe("formatDecimal", () => {
  it("uses a decimal point in English and a comma in German", () => {
    expect(formatDecimal("en", 1.2, 1)).toBe("1.2");
    expect(formatDecimal("de", 1.2, 1)).toBe("1,2");
  });

  it("keeps trailing zeros so slider labels stay aligned", () => {
    expect(formatDecimal("en", 1, 1)).toBe("1.0");
    expect(formatDecimal("de", 1, 1)).toBe("1,0");
    expect(formatDecimal("de", 3, 1)).toBe("3,0");
  });

  it("rounds to the requested number of fraction digits", () => {
    expect(formatDecimal("en", 1.25, 1)).toBe("1.3");
    expect(formatDecimal("de", 5.04, 1)).toBe("5,0");
  });

  it("defaults to one fraction digit", () => {
    expect(formatDecimal("de", 0.5)).toBe("0,5");
  });
});

describe("formatInteger", () => {
  it("rounds and groups thousands per locale", () => {
    expect(formatInteger("en", 12345)).toBe("12,345");
    expect(formatInteger("de", 12345)).toBe("12.345");
  });

  it("leaves small numbers ungrouped", () => {
    expect(formatInteger("en", 180)).toBe("180");
    expect(formatInteger("de", 180)).toBe("180");
  });

  it("rounds fractional input to a whole number", () => {
    expect(formatInteger("de", 44.6)).toBe("45");
  });
});
