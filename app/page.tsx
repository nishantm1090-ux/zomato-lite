export default function Home() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[560px] flex-col items-start justify-center px-6 py-12">
      <p className="text-sm text-neutral-500">Latest reviews, one restaurant at a time</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Ludhiana Burrito
      </h1>
      <p className="mt-3 leading-relaxed text-neutral-700">
        Indian &middot; Sector 32. See what people are saying, and add your own
        review.
      </p>
      <a
        href="/restaurant/1"
        className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-800"
      >
        See reviews
      </a>
    </main>
  );
}