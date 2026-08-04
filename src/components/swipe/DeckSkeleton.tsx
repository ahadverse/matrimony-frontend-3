export function DeckSkeleton() {
  return (
    <div
      className="surface-card mx-auto h-[min(72dvh,560px)] w-full max-w-[420px] animate-pulse overflow-hidden rounded-3xl"
      aria-hidden
    >
      <div className="h-3/5 w-full bg-[var(--color-surface)]" />
      <div className="flex flex-col gap-2 px-5 py-4">
        <div className="h-6 w-2/3 rounded-full bg-[var(--color-surface)]" />
        <div className="h-4 w-1/2 rounded-full bg-[var(--color-surface)]" />
        <div className="h-4 w-1/3 rounded-full bg-[var(--color-surface)]" />
      </div>
    </div>
  );
}
