import { notFound } from "next/navigation";
import { ReviewForm } from "./ReviewForm";

// Live data again — no build-time pre-rendering.
export const dynamic = "force-dynamic";

// The API lives on this same server. On Vercel we call the public production
// alias (the deployment-internal URL is protected, so calling it returns HTML).
const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

async function getRestaurantName(id: number): Promise<string | null> {
  const response = await fetch(`${baseUrl}/api/restaurants/${id}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const data = await response.json();
  return data.name;
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const id = Number(restaurantId);
  const name = await getRestaurantName(id);
  if (!name) notFound();

  return (
    <main className="mx-auto w-full max-w-[560px] px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-sm text-muted">Write a review</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {name}
      </h1>
      <ReviewForm restaurantId={id} />
    </main>
  );
}