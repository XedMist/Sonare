interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`bg-surface-700 rounded animate-pulse ${className}`} />;
}

// Preset skeleton components
export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-surface-800 rounded-lg p-4 space-y-3 ${className}`}>
      <Skeleton className="aspect-square w-full rounded-md" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTrackRow({ className = "" }: SkeletonProps) {
  return (
    <div className={`flex items-center gap-4 p-2 ${className}`}>
      <Skeleton className="w-10 h-10 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}
