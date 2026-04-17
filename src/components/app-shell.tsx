"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  Bug,
  ExternalLink,
  Scale,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import { cn, isDebugMode } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

function subscribeToDebugMode(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
}
function getDebugModeSnapshot() {
  return isDebugMode();
}
function getDebugModeServerSnapshot() {
  return false;
}

const primaryNav: { href: string; label: string }[] = [
  { href: "/", label: "Scheduler" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showDebug = useSyncExternalStore(
    subscribeToDebugMode,
    getDebugModeSnapshot,
    getDebugModeServerSnapshot
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <div className="ambient-orbs relative flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 py-safe-top md:px-6">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight transition-colors hover:text-foreground"
            aria-label="wattlyzer home"
          >
            wattlyzer
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-foreground/5 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            {showDebug ? (
              <Link
                href="/debug"
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive("/debug")
                    ? "bg-foreground/5 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                <Bug className="size-3.5" />
                Debug
              </Link>
            ) : null}
          </nav>

          <ThemeToggle />
        </div>

        {/* Mobile nav row */}
        <nav className="flex items-center gap-1 border-t border-border/60 px-4 pb-2 pt-2 md:hidden">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-1 items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive(item.href)
                  ? "bg-foreground/5 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          {showDebug ? (
            <Link
              href="/debug"
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive("/debug")
                  ? "bg-foreground/5 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <Bug className="size-3.5" />
              Debug
            </Link>
          ) : null}
        </nav>
      </header>

      <main className="relative flex-1">{children}</main>

      <footer className="mt-8 border-t border-border/60 bg-background/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-6 pb-safe-bottom text-xs text-muted-foreground md:px-6">
          <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
            <Link
              href="/legal"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Scale className="size-3.5" />
              Legal
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Shield className="size-3.5" />
              Privacy
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <SettingsIcon className="size-3.5" />
              Settings
            </Link>
            <Link
              href="https://github.com/F1nal04/wattlyzer"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              GitHub
            </Link>
          </nav>
          <div className="tabular-nums">
            © {new Date().getFullYear()} wattlyzer
          </div>
        </div>
      </footer>
    </div>
  );
}
