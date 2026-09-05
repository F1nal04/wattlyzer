// Pure detection: read navigator only in the install route's effect.
export function installPlatform(userAgent: string, maxTouchPoints = 0): "ios" | "android" | null {
  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)) {
    return "ios";
  }
  return /Android/i.test(userAgent) ? "android" : null;
}
