import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

/** Single shimmer block. Size it with className (w-*, h-*). */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={clsx("animate-shimmer rounded-lg bg-gray-100", className)} />;
}

/** Card-shaped placeholder matching the property card layout. */
export function SkeletonCard() {
  return (
    <div className="card" aria-hidden>
      <Skeleton className="h-36 mb-3 !rounded-lg" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  className?: string;
}

/** Grid of card placeholders for list pages while data loads. */
export default function SkeletonGrid({ count = 6, className }: SkeletonGridProps) {
  return (
    <div className={clsx("grid sm:grid-cols-2 lg:grid-cols-3 gap-5", className)} aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
