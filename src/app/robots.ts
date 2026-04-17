import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/** Block crawling of app sub-routes; `/` and static assets (e.g. `/_next/`) stay allowed. */
const DISALLOW_SUBROUTES = ["/settings", "/privacy", "/legal", "/debug"] as const;

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      disallow: [...DISALLOW_SUBROUTES],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
