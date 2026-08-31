import { describe, expect, it } from "bun:test";
import { frostedGlass } from "@/components/sky/glass";

describe("frostedGlass", () => {
  it("sets both backdrop-filter prefixes and a Safari GPU layer hint", () => {
    expect(frostedGlass(14)).toEqual({
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      transform: "translateZ(0)",
      WebkitTransform: "translateZ(0)",
    });
  });

  it("uses a literal blur radius so Safari does not ignore CSS variables", () => {
    expect(frostedGlass(8).backdropFilter).toBe("blur(8px)");
    expect(frostedGlass(8).WebkitBackdropFilter).toBe("blur(8px)");
  });
});
