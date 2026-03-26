"use client";

import Link from "next/link";
import {
  Bug,
  ExternalLink,
  Scale,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import { useSyncExternalStore } from "react";
import { isDebugMode } from "@/lib/utils";

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

export function FooterLinks() {
  const showDebugLink = useSyncExternalStore(
    subscribeToDebugMode,
    getDebugModeSnapshot,
    getDebugModeServerSnapshot
  );

  return (
    <div className="mt-10 pb-safe-bottom">
      <div className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/25 px-2 py-1.5 backdrop-blur-sm">
        <Link
          href="https://github.com/F1nal04/wattlyzer"
          target="_blank"
          rel="noopener noreferrer"
          prefetch={false}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          <ExternalLink className="size-3.5" />
          GitHub
        </Link>
        <Link
          href="/legal"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          <Scale className="size-3.5" />
          Legal
        </Link>
        <Link
          href="/privacy"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          <Shield className="size-3.5" />
          Privacy
        </Link>
        <Link
          href="/settings"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          <SettingsIcon className="size-3.5" />
          Settings
        </Link>
        {showDebugLink && (
          <Link
            href="/debug"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
          >
            <Bug className="size-3.5" />
            Debug
          </Link>
        )}
      </div>
    </div>
  );
}
