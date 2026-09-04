import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { IMPRESSUM, translatorFor as impressumFor } from "@wattlyzer/legal";

const legalRoute = readFileSync(
  join(import.meta.dir, "../../routes/legal.tsx"),
  "utf8",
);

// The PWA and the marketing site are two faces of one product, so their
// § 5 TMG notices have to say the same thing. They once did not: the PWA
// published a gmail address and a phone number the website never had.
describe("PWA impressum", () => {
  it("renders the shared operator details rather than its own copy", () => {
    expect(legalRoute).toContain("@wattlyzer/legal");
    expect(legalRoute).toContain("impressumAddressLines");
    expect(legalRoute).toContain("IMPRESSUM.email");
  });

  it("hard-codes no address, contact or disclaimer text of its own", () => {
    for (const literal of [
      "Leon Bojanowski",
      "Marienstraße",
      "Stahnsdorf",
      "@proton.me",
      "@gmail.com",
      "+49",
    ]) {
      expect(legalRoute).not.toContain(literal);
    }
  });

  it("publishes the proton address in both languages", () => {
    expect(IMPRESSUM.email).toBe("leongaborbojanowski@proton.me");
    expect(IMPRESSUM.email).not.toContain("gmail");
  });

  it("keeps only page chrome in its own catalog", () => {
    const en = readFileSync(join(import.meta.dir, "en.ts"), "utf8");
    for (const key of [
      '"legal.operator"',
      '"legal.contact"',
      '"legal.country"',
      '"legal.disclaimerBody"',
      '"legal.phoneLabel"',
    ]) {
      expect(en).not.toContain(key);
    }
  });

  it("uses the same disclaimer wording as the website", () => {
    expect(impressumFor("en")("informational")).toBe("Informational use only");
    expect(impressumFor("de")("informational")).toBe("Nur zur Information");
  });
});
