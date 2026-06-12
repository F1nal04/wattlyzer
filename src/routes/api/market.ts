import { createFileRoute } from "@tanstack/react-router";

// Best-effort in-memory cache to keep upstream request volume low,
// mirroring the previous Next.js revalidate window (30 minutes).
const CACHE_TTL_MS = 30 * 60 * 1000;
let cached: { body: string; timestamp: number } | null = null;

export const Route = createFileRoute("/api/market")({
  server: {
    handlers: {
      GET: async () => {
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          return new Response(cached.body, {
            status: 200,
            headers: {
              "content-type": "application/json",
              "x-cache": "hit",
            },
          });
        }

        const upstream = await fetch("https://api.awattar.de/v1/marketdata");
        if (!upstream.ok) {
          return new Response(null, { status: upstream.status });
        }

        const body = await upstream.text();
        cached = { body, timestamp: Date.now() };

        return new Response(body, {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "public, s-maxage=1800, stale-while-revalidate=300",
          },
        });
      },
    },
  },
});
