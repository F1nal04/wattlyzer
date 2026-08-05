import { useEffect, useState } from "react";

// Current time as state instead of `new Date()` in render bodies: keeps
// components pure so the React Compiler can memoize them, and refreshes
// time-derived UI (theme hour, schedule) on a fixed cadence rather than
// only on incidental re-renders.
export function useNow(refreshMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), refreshMs);
    return () => clearInterval(timer);
  }, [refreshMs]);
  return now;
}
