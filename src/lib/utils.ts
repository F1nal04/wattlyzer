import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if debug features should be enabled
 * @returns true if debug features should be shown
 */
export function isDebugMode(): boolean {
  // Server-side rendering check
  if (typeof window === "undefined") {
    return false;
  }

  // Check if we're on a dev/development subdomain
  const hostname = window.location.hostname;
  const isDevSubdomain =
    hostname.includes("dev") || hostname.includes("development");

  // Check for debug search parameter
  const searchParams = new URLSearchParams(window.location.search);
  const hasDebugParam = searchParams.get("env") === "debug";

  // Also check NODE_ENV for local development
  const isLocalDev = process.env.NODE_ENV === "development";

  return isDevSubdomain || hasDebugParam || isLocalDev;
}
