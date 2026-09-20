"use client";

import { useState } from "react";
import { Celebration } from "./Celebration";

// This is the only file that can feel clicks — the browser runs it.
export function ReviewForm({ restaurantId }: { restaurantId: number }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        setSubmitted(true);
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

  if (submitted) {
    return <Celebration restaurantId={restaurantId} />;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      {/* Star picker */}
      <fieldset>
        <legend className="text-sm font-medium text-foreground/90">
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
              className={`text-4xl transition-colors sm:text-5xl ${
                n <= rating ? "text-accent" : "text-star-empty"
              }`}
            >
              ★
            </button>
          ))}
          <span className="ml-3 text-sm text-muted" aria-live="polite">
            {rating > 0 ? `${rating} / 5` : "Tap to rate"}
          </span>
        </div>
      </fieldset>

      {/* Comment box */}
      <fieldset>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-foreground/90"
        >
          Your comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={5}
          placeholder="What was it like?"
          className="mt-3 w-full rounded-lg border border-edge bg-background px-4 py-3 leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </fieldset>

      {/* Backend's answer, shown verbatim */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger-edge bg-danger-bg px-4 py-3 text-sm text-danger-text"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={
          canSubmit
            ? "btn-primary w-full"
            : "w-full cursor-not-allowed rounded-lg bg-edge px-6 py-3 text-sm font-medium text-muted"
        }
      >
        {submitting ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}