import { notFound } from "next/navigation";
import Link from "next/link";

// This page reads live data, so it must never be pre-rendered at build time.
export const dynamic = "force-dynamic";

// The API lives on this same server. On Vercel we call the public production
// alias (the deployment-internal URL is protected, so calling it returns HTML).
const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantResponse = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

async function getRestaurant(id: number): Promise<RestaurantResponse | null> {
  const response = await fetch(`${baseUrl}/api/restaurants/${id}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return response.json();
}

// Presentational helpers — painting, not calculating.
function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="text-lg tracking-wide sm:text-xl"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= rating ? "text-accent" : "text-star-empty"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurantId = Number(id);
  const restaurant = await getRestaurant(restaurantId);
  if (!restaurant) notFound();

  const hasReviews = restaurant.totalReviews > 0;

  return (
    <main className="mx-auto w-full max-w-[560px] px-5 py-10 sm:px-6 sm:py-14">
      {/* 1. Name, with cuisine and area underneath */}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {restaurant.name}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {restaurant.cuisine} &middot; {restaurant.area}
      </p>

      {/* 2. The average rating — the biggest thing on the page.
          THIS is the line that prints the average:
          the backend computed it, we just display it. */}
      <section className="mt-10 sm:mt-12">
        {restaurant.averageRating !== null ? (
          <p className="text-6xl font-semibold tracking-tight text-foreground sm:text-7xl">
            {restaurant.averageRating}
          </p>
        ) : (
          <p className="text-6xl font-semibold tracking-tight text-foreground sm:text-7xl">
            &mdash;
          </p>
        )}
        <p className="mt-1 text-sm text-muted">
          from {restaurant.totalReviews}{" "}
          {restaurant.totalReviews === 1 ? "review" : "reviews"}
        </p>
      </section>

      {/* 3. The latest review, visually set apart */}
      {restaurant.latestReview && (
        <section className="card-accent mt-10 p-6 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Latest review
          </p>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <Stars rating={restaurant.latestReview.rating} />
            <p className="text-xs text-muted">
              {formatDate(restaurant.latestReview.createdAt)}
            </p>
          </div>
          <p className="mt-3 leading-relaxed text-foreground/90">
            {restaurant.latestReview.comment}
          </p>
        </section>
      )}

      {/* 4. Older reviews, in a plain list */}
      {restaurant.reviews.length > 0 && (
        <ul className="mt-10 space-y-6">
          {restaurant.reviews.map((review) => (
            <li key={review.id} className="border-b border-edge pb-6">
              <div className="flex items-baseline justify-between gap-4">
                <Stars rating={review.rating} />
                <p className="text-xs text-muted">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <p className="mt-2 leading-relaxed text-foreground/90">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* 6. The empty state, when there is nothing to show yet */}
      {!hasReviews && (
        <section className="card-dashed mt-10 p-10 text-center">
          <p className="text-foreground/90">No reviews yet.</p>
          <p className="mt-1 text-sm text-muted">
            Be the first to review {restaurant.name}.
          </p>
        </section>
      )}

      {/* 5. The way in — writing a review */}
      <Link href={`/review/${restaurantId}`} className="btn-primary mt-12">
        Write a review
      </Link>
    </main>
  );
}