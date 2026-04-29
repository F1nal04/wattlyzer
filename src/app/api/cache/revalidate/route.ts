import { revalidateTag } from "next/cache";

export async function POST() {
  revalidateTag("solar", "max");
  revalidateTag("market", "max");
  return new Response(null, { status: 204 });
}
