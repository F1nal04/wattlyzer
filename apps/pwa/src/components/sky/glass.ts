import type { CSSProperties } from "react";

// Safari (iOS and macOS) defers painting backdrop-filter until a compositor
// update — scroll, window move, or rotation — unless the element already
// has its own GPU layer. Keep this the only frosted-glass style in the
// app. Do not wrap these surfaces in an ancestor opacity animation: opacity
// < 1 is a backdrop root and the blur will sample nothing behind it.
export function frostedGlass(blurPx: number): CSSProperties {
  return {
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`,
    transform: "translateZ(0)",
    WebkitTransform: "translateZ(0)",
  };
}
