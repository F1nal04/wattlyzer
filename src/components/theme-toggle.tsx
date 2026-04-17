"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const current = theme ?? "system";
  const next =
    current === "light" ? "dark" : current === "dark" ? "system" : "light";
  const label = `Switch theme (currently ${current})`;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full",
        "border border-border bg-card/60 text-muted-foreground backdrop-blur",
        "transition-all hover:scale-105 hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <Sun
        suppressHydrationWarning
        className={cn("size-4", current === "light" ? "block" : "hidden")}
      />
      <Moon
        suppressHydrationWarning
        className={cn("size-4", current === "dark" ? "block" : "hidden")}
      />
      <Laptop
        suppressHydrationWarning
        className={cn(
          "size-4",
          current !== "light" && current !== "dark" ? "block" : "hidden"
        )}
      />
    </button>
  );
}
