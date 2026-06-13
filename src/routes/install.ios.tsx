import { createFileRoute } from "@tanstack/react-router";
import { InstallIOS } from "@/components/sky/install";

export const Route = createFileRoute("/install/ios")({
  component: InstallIOS,
});
