"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// This is the only file that can feel clicks — the browser runs it.
export function ReviewForm({
  restaurantId,
  restaurantName,
}: {
  restaurantId: number;
  restaurantName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = rating > 0 && comment.trim() !== "" && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, comment }),
      });

      if (response.ok) {
        router.push(`/restaurant/${restaurantId}`);
        return;
      }

      // Show exactly what the backend said — never invent our own message.
      const data = await response.json();
      setError(typeof data.error === "string" ? data.error : "Something went wrong.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      {/* Star picker */}
      <fieldset>
        <legend className="text-sm font-medium text-neutral-800">
          Your rating
        </legend>
        <div className="mt-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              className={`text-4xl transition-colors ${
                n <= rating ? "text-accent" : "text-neutral-300"
              }`}
            >
              ★
            </button>
          ))}
          <span className="ml-3 text-sm text-neutral-500" aria-live="polite">
            {rating > 0 ? `${rating} / 5` : "Tap to rate"}
          </span>
        </div>
      </fieldset>

      {/* Comment box */}
      <fieldset>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-neutral-800"
        >
          Your comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={5}
          placeholder="What was it like?"
          className="mt-3 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 leading-relaxed outline-none transition-colors focus:border-accent"
        />
      </fieldset>

      {/* Backend's answer, shown verbatim */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
          canSubmit
            ? "bg-accent text-white hover:bg-amber-800"
            : "cursor-not-allowed bg-neutral-200 text-neutral-400"
        }`}
      >
        {submitting ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}