import { createFileRoute } from "@tanstack/react-router";

// Best-effort in-memory cache to keep upstream request volume low,
// mirroring the previous Next.js revalidate window (1 hour).
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { body: string; timestamp: number }>();

export const Route = createFileRoute("/api/solar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sp = new URL(request.url).searchParams;
        const lat = sp.get("lat");
        const lng = sp.get("lng");
        const angle = sp.get("angle");
        const azimutParam = sp.get("azimut");
        const kwh = sp.get("kwh");

        if (!lat || !lng || !angle || !azimutParam || !kwh) {
          return Response.json(
            { error: "missing required params" },
            { status: 400 },
          );
        }

        const azimut = Number(azimutParam);
        const apiAzimut = (azimut % 360) - 180;
        const url = `https://api.forecast.solar/estimate/watthours/${lat}/${lng}/${angle}/${apiAzimut}/${kwh}`;

        const cached = cache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          return new Response(cached.body, {
            status: 200,
            headers: {
              "content-type": "application/json",
              "x-cache": "hit",
            },
          });
        }

        const upstream = await fetch(url);
        if (!upstream.ok) {
          return Response.json(
            { error: "upstream error" },
            { status: upstream.status },
          );
        }

        const body = await upstream.text();
        cache.set(url, { body, timestamp: Date.now() });

        return new Response(body, {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "public, s-maxage=3600, stale-while-revalidate=600",
          },
        });
      },
    },
  },
});
