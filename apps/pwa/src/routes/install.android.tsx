import { createFileRoute } from "@tanstack/react-router";
import { InstallAndroid } from "@/components/sky/install";

export const Route = createFileRoute("/install/android")({
  component: InstallAndroid,
});
