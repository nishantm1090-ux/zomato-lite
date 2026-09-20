import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-[560px] flex-col items-start justify-center px-5 py-12 sm:px-6">
      <p className="text-sm text-muted">Latest reviews, one restaurant at a time</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Ludhiana Burrito
      </h1>
      <p className="mt-4 max-w-sm leading-relaxed text-muted">
        Indian &middot; Sector 32. See what people are saying, and add your own
        review.
      </p>
      <Link href="/restaurant/1" className="btn-primary mt-10">
        See reviews
      </Link>
    </main>
  );
}