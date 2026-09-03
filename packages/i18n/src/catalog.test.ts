import { describe, expect, it } from "bun:test";
import { createTranslator } from "./catalog";

const en = {
  greeting: "Good morning",
  runFor: "Run for {hours}h",
} as const;

const de: Record<keyof typeof en, string> = {
  greeting: "Guten Morgen",
  runFor: "Laufzeit {hours} h",
};

const { translate, translatorFor, messages } = createTranslator({ en, de });

describe("createTranslator", () => {
  it("returns the message for the requested locale", () => {
    expect(translate("en", "greeting")).toBe("Good morning");
    expect(translate("de", "greeting")).toBe("Guten Morgen");
  });

  it("interpolates values into the locale's own template", () => {
    expect(translate("en", "runFor", { hours: 3 })).toBe("Run for 3h");
    expect(translate("de", "runFor", { hours: 3 })).toBe("Laufzeit 3 h");
  });

  it("exposes the catalogs it was built from", () => {
    expect(messages.en).toBe(en);
    expect(messages.de).toBe(de);
  });
});

describe("translatorFor", () => {
  it("binds a locale so callers can pass a plain function around", () => {
    const t = translatorFor("de");
    expect(t("greeting")).toBe("Guten Morgen");
    expect(t("runFor", { hours: 5 })).toBe("Laufzeit 5 h");
  });

  it("returns the same instance per locale so it is a stable dependency", () => {
    // Components receive this as a prop / hook value; a fresh closure each
    // call would defeat memoization and effect dependency checks.
    expect(translatorFor("de")).toBe(translatorFor("de"));
    expect(translatorFor("en")).not.toBe(translatorFor("de"));
  });

  it("keeps separate translator instances per catalog set", () => {
    const other = createTranslator({
      en: { greeting: "Hi" },
      de: { greeting: "Hallo" },
    });
    expect(other.translatorFor("de")("greeting")).toBe("Hallo");
    expect(translatorFor("de")("greeting")).toBe("Guten Morgen");
  });
});
