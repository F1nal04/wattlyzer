import { describe, expect, it } from "bun:test";
import { placeholdersIn } from "@wattlyzer/i18n";
import { en } from "@/lib/i18n/en";
import { de } from "@/lib/i18n/de";
import { messages, translate } from "@/lib/i18n";

const keys = Object.keys(en) as (keyof typeof en)[];

describe("translate", () => {
  it("returns the message for the requested locale", () => {
    expect(translate("en", "common.back")).toBe("Back");
    expect(translate("de", "common.back")).toBe("Zurück");
  });

  it("substitutes placeholders with the given values", () => {
    expect(translate("en", "unit.kwh", { value: "1.2" })).toBe("1.2 kWh");
    expect(translate("de", "unit.kwh", { value: "1,2" })).toBe("1,2 kWh");
  });

  it("substitutes every placeholder of a multi-slot message", () => {
    expect(
      translate("en", "home.marketCoverage", { covered: 18, window: 24 }),
    ).toBe("Prices cover 18h of the 24h window");
    expect(
      translate("de", "home.marketCoverage", { covered: 18, window: 24 }),
    ).toBe("Preise decken 18 h von 24 h ab");
  });
});

describe("catalogs", () => {
  it("covers both locales of the shared locale model", () => {
    expect(Object.keys(messages).sort()).toEqual(["de", "en"]);
  });

  it("translates every English key into German", () => {
    const missing = keys.filter((key) => !(key in de));
    expect(missing).toEqual([]);
  });

  it("has no German key that English does not define", () => {
    const extra = Object.keys(de).filter((key) => !(key in en));
    expect(extra).toEqual([]);
  });

  it("has no empty message in either locale", () => {
    const blank = keys.filter(
      (key) => en[key].trim() === "" || de[key].trim() === "",
    );
    expect(blank).toEqual([]);
  });

  it("keeps the same placeholders in both locales", () => {
    const mismatched = keys.filter((key) => {
      const source = placeholdersIn(en[key]);
      const target = placeholdersIn(de[key]);
      return (
        source.size !== target.size ||
        [...source].some((name) => !target.has(name))
      );
    });
    expect(mismatched).toEqual([]);
  });
});
