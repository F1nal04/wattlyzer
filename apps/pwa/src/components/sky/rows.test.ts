import { describe, expect, it } from "bun:test";
import { azimuthKey } from "@/components/sky/rows";
import { translatorFor } from "@/lib/i18n";

const en = translatorFor("en");
const de = translatorFor("de");

describe("azimuthKey", () => {
  it("maps the cardinal directions", () => {
    expect(en(azimuthKey(0))).toBe("N");
    expect(en(azimuthKey(90))).toBe("E");
    expect(en(azimuthKey(180))).toBe("S");
    expect(en(azimuthKey(270))).toBe("W");
  });

  it("maps the intercardinal directions", () => {
    expect(en(azimuthKey(45))).toBe("NE");
    expect(en(azimuthKey(135))).toBe("SE");
    expect(en(azimuthKey(225))).toBe("SW");
    expect(en(azimuthKey(315))).toBe("NW");
  });

  it("uses the German compass, where east is O", () => {
    expect(de(azimuthKey(90))).toBe("O");
    expect(de(azimuthKey(45))).toBe("NO");
    expect(de(azimuthKey(135))).toBe("SO");
    // The shared letters stay put.
    expect(de(azimuthKey(180))).toBe("S");
    expect(de(azimuthKey(270))).toBe("W");
  });

  it("snaps to the nearest of the 8 points", () => {
    expect(en(azimuthKey(22))).toBe("N");
    expect(en(azimuthKey(23))).toBe("NE");
    expect(en(azimuthKey(170))).toBe("S");
  });

  it("wraps degrees outside 0-360, including negatives", () => {
    expect(en(azimuthKey(360))).toBe("N");
    expect(en(azimuthKey(450))).toBe("E");
    expect(en(azimuthKey(-90))).toBe("W");
  });
});
