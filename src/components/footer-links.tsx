"use client";

import Link from "next/link";
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
          className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          GitHub
        </Link>
        <Link
          href="/legal"
          className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          Legal
        </Link>
        <Link
          href="/privacy"
          className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          Privacy
        </Link>
        <Link
          href="/settings"
          className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
        >
          Settings
        </Link>
        {showDebugLink && (
          <Link
            href="/debug"
            className="shrink-0 rounded-full px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap transition-colors hover:bg-white/8 hover:text-white sm:px-3 sm:py-2 sm:text-sm"
          >
            Debug
          </Link>
        )}
      </div>
    </div>
  );
}
