export async function GET() {
  const upstream = await fetch("https://api.awattar.de/v1/marketdata", {
    next: { revalidate: 1800, tags: ["market"] },
  });

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
