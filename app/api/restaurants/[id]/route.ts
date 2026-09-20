import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// This route talks to the database, so it must never be pre-rendered.
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/restaurants/[id] — load everything the restaurant page needs.
// The shape of this answer matches the shape of the screen, so the frontend
// does no maths: it just renders what it is handed.
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const restaurants = await sql`
    SELECT id, name, cuisine, area
    FROM restaurants
    WHERE id = ${restaurantId}
  `;
  if (restaurants.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }
  const restaurant = restaurants[0];

  // Newest first, so the first row is "the latest review".
  const allReviews = await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC
  `;

  const totalReviews = allReviews.length;
  const latestReview = totalReviews > 0 ? allReviews[0] : null;
  const olderReviews = allReviews.slice(1);

  // AVG(rating) is computed right now, at the moment somebody asks.
  let averageRating: number | null = null;
  if (totalReviews > 0) {
    const avgRow = await sql`
      SELECT ROUND(AVG(rating)::numeric, 1) AS average
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
    `;
    averageRating = Number(avgRow[0].average);
  }

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews,
    latestReview: latestReview
      ? {
          id: latestReview.id,
          rating: latestReview.rating,
          comment: latestReview.comment,
          createdAt: latestReview.created_at,
        }
      : null,
    reviews: olderReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    })),
  });
}