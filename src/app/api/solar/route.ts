import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = sp.get("lat");
  const lng = sp.get("lng");
  const angle = sp.get("angle");
  const azimutParam = sp.get("azimut");
  const kwh = sp.get("kwh");

  if (!lat || !lng || !angle || !azimutParam || !kwh) {
    return NextResponse.json(
      { error: "missing required params" },
      { status: 400 }
    );
  }

  const azimut = Number(azimutParam);
  const apiAzimut = (azimut % 360) - 180;

  const url = `https://api.forecast.solar/estimate/watthours/${lat}/${lng}/${angle}/${apiAzimut}/${kwh}`;
  const upstream = await fetch(url, {
    next: { revalidate: 3600, tags: ["solar"] },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "upstream error" },
      { status: upstream.status }
    );
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
