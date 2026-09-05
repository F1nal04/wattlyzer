import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InstallChooser } from "@/components/sky/install";
import { installPlatform } from "@/lib/install-platform";

export const Route = createFileRoute("/install/")({
  component: InstallEntry,
});

function InstallEntry() {
  const navigate = useNavigate();
  useEffect(() => {
    const platform = installPlatform(navigator.userAgent, navigator.maxTouchPoints);
    if (platform) {
      void navigate({
        to: platform === "ios" ? "/install/ios" : "/install/android",
        search: (previous) => previous,
        replace: true,
      });
    }
  }, [navigate]);
  return <InstallChooser />;
}
