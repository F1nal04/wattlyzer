import { useEffect, useState } from "react";
import packageJson from "../../package.json";

export const APP_VERSION = packageJson.version;

// Pure: a deployed build is "new" when it reports any version but ours.
export function isNewerBuild(running: string, deployed: unknown): boolean {
  return typeof deployed === "string" && deployed !== "" && deployed !== running;
}

// Checks /version.json on mount and whenever the tab becomes visible again.
// Offline or a failed fetch simply means "no update known".
export function useDeployedUpdate(): { available: boolean; dismiss: () => void } {
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/version.json", { cache: "no-store" })
        .then((res) => res.json())
        .then((body: { version?: unknown }) => {
          if (isNewerBuild(APP_VERSION, body?.version)) setAvailable(true);
        })
        .catch(() => {});
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, []);

  return { available: available && !dismissed, dismiss: () => setDismissed(true) };
}
