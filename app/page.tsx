import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-[560px] flex-col justify-center px-5 py-12 sm:px-6">
      {/* Banner — the face of the place. */}
      <section className="card-accent overflow-hidden p-8 text-center sm:p-10">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          Sector 32 &middot; Ludhiana
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ludhiana Burrito
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">
          Honest reviews of the wrap people queue for — fresh from real
          customers.
        </p>
        <div
          aria-hidden="true"
          className="mt-6 text-xl tracking-[0.35em] text-accent"
        >
          ★★★★★
        </div>
      </section>

      {/* The two ways in. */}
      <nav className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link href="/restaurant/1" className="btn-primary text-center">
          See reviews
        </Link>
        <Link href="/review/1" className="btn-secondary text-center">
          Write a review
        </Link>
      </nav>
    </main>
  );
}