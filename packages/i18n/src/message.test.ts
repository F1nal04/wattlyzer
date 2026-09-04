import { describe, expect, it } from "bun:test";
import { interpolate, placeholdersIn, splitTemplate } from "./message";

describe("interpolate", () => {
  it("substitutes named placeholders", () => {
    expect(interpolate("Run for {hours}h", { hours: 3 })).toBe("Run for 3h");
  });

  it("substitutes every occurrence of the same placeholder", () => {
    expect(interpolate("{a} and {a}", { a: "x" })).toBe("x and x");
  });

  it("returns the template untouched when there is nothing to substitute", () => {
    expect(interpolate("Settings")).toBe("Settings");
    expect(interpolate("Settings", {})).toBe("Settings");
  });

  it("leaves unknown placeholders in place instead of printing undefined", () => {
    expect(interpolate("Hi {name}", {})).toBe("Hi {name}");
  });

  it("accepts numbers and pre-formatted strings alike", () => {
    expect(interpolate("{count} of {total}", { count: 2, total: "12" })).toBe(
      "2 of 12",
    );
  });
});

describe("placeholdersIn", () => {
  it("lists the placeholder names used by a template", () => {
    expect(placeholdersIn("Prices cover {covered}h of {window}h")).toEqual(
      new Set(["covered", "window"]),
    );
  });

  it("de-duplicates repeated placeholders", () => {
    expect(placeholdersIn("{a} {a} {b}")).toEqual(new Set(["a", "b"]));
  });

  it("is empty for a template without placeholders", () => {
    expect(placeholdersIn("Settings")).toEqual(new Set());
  });
});

describe("splitTemplate", () => {
  it("splits a template into literal text and named slots", () => {
    expect(splitTemplate("Run when energy is {clean} and {cheap}.")).toEqual([
      { type: "text", value: "Run when energy is " },
      { type: "slot", name: "clean" },
      { type: "text", value: " and " },
      { type: "slot", name: "cheap" },
      { type: "text", value: "." },
    ]);
  });

  it("keeps a different word order intact, which is the point for German", () => {
    expect(splitTemplate("Läuft, wenn Energie {clean} und {cheap} ist.")).toEqual([
      { type: "text", value: "Läuft, wenn Energie " },
      { type: "slot", name: "clean" },
      { type: "text", value: " und " },
      { type: "slot", name: "cheap" },
      { type: "text", value: " ist." },
    ]);
  });

  it("handles a slot at the very start and end without emitting empty text", () => {
    expect(splitTemplate("{a} mid {b}")).toEqual([
      { type: "slot", name: "a" },
      { type: "text", value: " mid " },
      { type: "slot", name: "b" },
    ]);
  });

  it("returns a single text part for a template without slots", () => {
    expect(splitTemplate("Settings")).toEqual([
      { type: "text", value: "Settings" },
    ]);
  });

  it("returns nothing for an empty template", () => {
    expect(splitTemplate("")).toEqual([]);
  });
});
