import Link from "next/link";
import { Banner } from "./components/Banner";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-[560px] flex-col justify-center px-5 py-12 sm:px-6">
      {/* Banner — the face of the place. */}
      <Banner
        kicker="Sector 32 · Ludhiana"
        title="Ludhiana Burrito"
        tagline="Honest reviews of the wrap people queue for — fresh from real customers."
        showStars
      />

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