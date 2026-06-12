import { createFileRoute } from "@tanstack/react-router";

// Plain pass-through proxy — caching happens client-side in the
// persisted TanStack Query cache (local-first).
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

        const upstream = await fetch(url);
        if (!upstream.ok) {
          return Response.json(
            { error: "upstream error" },
            { status: upstream.status },
          );
        }

        return new Response(upstream.body, {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
