/**
 * Public site origin (no trailing slash) for absolute URLs: `metadataBase`,
 * `robots.ts` / `sitemap.ts`, and any future metadata. Prefer
 * `NEXT_PUBLIC_SITE_URL` in production so the canonical host is not `*.vercel.app`.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
