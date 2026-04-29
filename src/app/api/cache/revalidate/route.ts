import { revalidateTag } from "next/cache";

export async function POST() {
  revalidateTag("solar");
  revalidateTag("market");
  return new Response(null, { status: 204 });
}
