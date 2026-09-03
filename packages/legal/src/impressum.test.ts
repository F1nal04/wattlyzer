import { describe, expect, it } from "bun:test";
import { placeholdersIn } from "@wattlyzer/i18n";
import {
  IMPRESSUM,
  de,
  en,
  impressumAddressLines,
  translatorFor,
} from "./impressum";

const keys = Object.keys(en) as (keyof typeof en)[];

describe("IMPRESSUM", () => {
  it("publishes the proton contact address", () => {
    // Regression: the PWA and the website drifted apart and shipped two
    // different contact addresses for the same operator.
    expect(IMPRESSUM.email).toBe("leongaborbojanowski@proton.me");
  });

  it("carries the operator details § 5 TMG requires", () => {
    expect(IMPRESSUM.name).toBe("Leon Bojanowski");
    expect(IMPRESSUM.street).toBe("Marienstraße 3b");
    expect(IMPRESSUM.city).toBe("14532 Stahnsdorf");
  });
});

describe("impressumAddressLines", () => {
  it("renders the address with the country in the reader's language", () => {
    expect(impressumAddressLines("en")).toEqual([
      "Leon Bojanowski",
      "Marienstraße 3b",
      "14532 Stahnsdorf",
      "Germany",
    ]);
    expect(impressumAddressLines("de")).toEqual([
      "Leon Bojanowski",
      "Marienstraße 3b",
      "14532 Stahnsdorf",
      "Deutschland",
    ]);
  });

  it("only translates the country — a name and street do not change", () => {
    const [enName, enStreet, enCity] = impressumAddressLines("en");
    const [deName, deStreet, deCity] = impressumAddressLines("de");
    expect([deName, deStreet, deCity]).toEqual([enName, enStreet, enCity]);
  });
});

describe("impressum catalog", () => {
  it("translates every English key into German", () => {
    expect(keys.filter((key) => !(key in de))).toEqual([]);
  });

  it("has no German key that English does not define", () => {
    expect(Object.keys(de).filter((key) => !(key in en))).toEqual([]);
  });

  it("has no empty message in either locale", () => {
    expect(
      keys.filter((key) => !en[key].trim() || !de[key].trim()),
    ).toEqual([]);
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

  it("states the informational-use disclaimer in both languages", () => {
    expect(translatorFor("en")("informational")).toBe("Informational use only");
    expect(translatorFor("de")("informational")).toBe("Nur zur Information");
    expect(translatorFor("de")("informationalBody")).toContain("Schätzungen");
  });
});
