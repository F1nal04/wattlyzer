import { createFileRoute } from "@tanstack/react-router";

// Plain pass-through proxy — caching happens client-side in the
// persisted TanStack Query cache (local-first).
export const Route = createFileRoute("/api/market")({
  server: {
    handlers: {
      GET: async () => {
        const upstream = await fetch("https://api.awattar.de/v1/marketdata");
        if (!upstream.ok) {
          return new Response(null, { status: upstream.status });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
