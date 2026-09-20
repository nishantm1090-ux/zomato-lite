// One banner, reused wherever we want it — the design system's welcome band.
type BannerProps = {
  kicker: string;
  title?: string;
  tagline?: string;
  showStars?: boolean;
};

export function Banner({ kicker, title, tagline, showStars = false }: BannerProps) {
  return (
    <section className="card-accent overflow-hidden p-8 text-center sm:p-10">
      <p className="text-xs font-medium uppercase tracking-widest text-accent">
        {kicker}
      </p>
      {title && (
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
      )}
      {tagline && (
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">
          {tagline}
        </p>
      )}
      {showStars && (
        <div
          aria-hidden="true"
          className="mt-6 text-xl tracking-[0.35em] text-accent"
        >
          ★★★★★
        </div>
      )}
    </section>
  );
}