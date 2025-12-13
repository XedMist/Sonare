import { Skeleton } from "~/components/ui/Skeleton";
import { cn } from "~/lib/utils";

interface CardSkeletonProps {
    className?: string;
}

export function TrackSkeleton() {
    return (
        <div className="flex items-center gap-4 p-3">
            <Skeleton className="w-8 h-4" />
            <Skeleton className="w-12 h-12 rounded-md" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-12 h-4" />
        </div>
    );
}

export function AlbumSkeleton({ className }: CardSkeletonProps) {
    return (
        <div className={cn("p-4 rounded-xl bg-surface-800/40", className)}>
            <Skeleton className="aspect-square rounded-lg mb-4" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );
}

export function ArtistSkeleton({ className }: CardSkeletonProps) {
    return (
        <div className={cn("p-4 rounded-xl bg-surface-800/40", className)}>
            <div className="mx-auto max-w-[160px]">
                <Skeleton className="aspect-square rounded-full mb-4" />
            </div>
            <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
    );
}

export function PlaylistSkeleton({ className }: CardSkeletonProps) {
    return (
        <div className={cn("p-4 rounded-xl bg-surface-800/40", className)}>
            <Skeleton className="aspect-square rounded-lg mb-4" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
        </div>
    );
}

export function TrackListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-1">
            {Array.from({ length: count }).map((_, i) => (
                <TrackSkeleton key={i} />
            ))}
        </div>
    );
}

export function CardGridSkeleton({
    count = 6,
    type = "album",
}: {
    count?: number;
    type?: "album" | "artist" | "playlist";
}) {
    const SkeletonComponent = {
        album: AlbumSkeleton,
        artist: ArtistSkeleton,
        playlist: PlaylistSkeleton,
    }[type];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonComponent key={i} />
            ))}
        </div>
    );
}

// Full page loading spinner
export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-surface-700 border-t-primary-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

// Empty state
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && (
                <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mb-6 text-surface-500">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-surface-200 mb-2">{title}</h3>
            {description && (
                <p className="text-surface-400 max-w-md mb-6">{description}</p>
            )}
            {action}
        </div>
    );
}
