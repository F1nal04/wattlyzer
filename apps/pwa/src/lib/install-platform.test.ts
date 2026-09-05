import { expect, test } from "bun:test";
import { installPlatform } from "./install-platform";

test("recognizes iOS, Android and desktop-mode iPadOS", () => {
  for (const device of ["iPhone", "iPad", "iPod"]) {
    expect(installPlatform(`Mozilla/5.0 (${device}; CPU OS 18_0 like Mac OS X)`)).toBe("ios");
  }
  expect(installPlatform("Mozilla/5.0 (Linux; Android 15; Pixel 9)")).toBe("android");
  expect(installPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari/605.1", 5)).toBe("ios");
});

test("leaves desktops and unknown devices on the chooser", () => {
  for (const ua of ["", "unknown", "Mozilla/5.0 (Windows NT 10.0)", "Mozilla/5.0 (X11; Linux x86_64)", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)"]) {
    expect(installPlatform(ua)).toBeNull();
  }
  expect(installPlatform("Macintosh", 1)).toBeNull();
});
