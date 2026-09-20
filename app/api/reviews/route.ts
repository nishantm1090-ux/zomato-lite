import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// This route talks to the database, so it must never be pre-rendered.
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

// POST /api/reviews — save a review.
// Validates in this order: 1) rating, 2) comment, 3) restaurant exists.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = (body ?? {}) as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // Check 1: rating is a whole number from 1 to 5.
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number from 1 to 5." },
      { status: 400 }
    );
  }

  // Check 2: comment is a non-empty string after trimming whitespace.
  if (typeof comment !== "string" || comment.trim() === "") {
    return NextResponse.json(
      { error: "Comment must be a non-empty message." },
      { status: 400 }
    );
  }

  // Check 3: restaurantId refers to a restaurant that actually exists.
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "restaurantId must be a whole number." },
      { status: 400 }
    );
  }
  const match = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (match.length === 0) {
    return NextResponse.json(
      { error: `Restaurant ${restaurantId} does not exist.` },
      { status: 400 }
    );
  }

  // All checks passed — insert exactly one row and nothing else.
  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return NextResponse.json({ success: true, reviewId: inserted[0].id }, { status: 201 });
}