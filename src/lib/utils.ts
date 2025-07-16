import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single string, resolving Tailwind CSS class conflicts.
 *
 * Accepts any number of class values, merges them using `clsx`, and then applies `twMerge` to ensure Tailwind classes are deduplicated and conflicts are resolved.
 *
 * @returns The final merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determines whether debug features should be enabled based on the current environment.
 *
 * Returns `true` if running in a browser and any of the following conditions are met: the hostname contains "dev" or "development", the URL includes the `debug=true` search parameter, or the `NODE_ENV` environment variable is set to "development".
 *
 * @returns Whether debug features should be enabled
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
  const hasDebugParam = searchParams.get("debug") === "true";

  // Also check NODE_ENV for local development
  const isLocalDev = process.env.NODE_ENV === "development";

  return isDevSubdomain || hasDebugParam || isLocalDev;
}
