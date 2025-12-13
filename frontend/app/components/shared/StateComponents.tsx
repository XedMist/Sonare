import { Button } from "../ui";
import { MusicNoteIcon, SearchIcon, AlertCircleIcon, PlaylistIcon } from "../icons/Icons";

// ============================================
// LOADING STATE
// ============================================

interface LoadingSectionProps {
  message?: string;
  className?: string;
}

export function LoadingSection({ message = "Loading...", className = "" }: LoadingSectionProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="relative">
        <div className="w-16 h-16 border-4 border-surface-700 border-t-primary-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MusicNoteIcon size={24} className="text-primary-500 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-surface-400 text-sm">{message}</p>
    </div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="aspect-square bg-surface-800 rounded-lg mb-3" />
      <div className="h-4 bg-surface-800 rounded w-3/4 mb-2" />
      <div className="h-3 bg-surface-800 rounded w-1/2" />
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  className?: string;
}

export function SkeletonGrid({ count = 6, className = "" }: SkeletonGridProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

interface SkeletonTrackRowProps {
  className?: string;
}

export function SkeletonTrackRow({ className = "" }: SkeletonTrackRowProps) {
  return (
    <div className={`flex items-center gap-4 p-2 animate-pulse ${className}`}>
      <div className="w-8 h-4 bg-surface-800 rounded" />
      <div className="w-10 h-10 bg-surface-800 rounded" />
      <div className="flex-1">
        <div className="h-4 bg-surface-800 rounded w-1/3 mb-2" />
        <div className="h-3 bg-surface-800 rounded w-1/4" />
      </div>
      <div className="w-10 h-4 bg-surface-800 rounded" />
    </div>
  );
}

interface SkeletonTrackListProps {
  count?: number;
  className?: string;
}

export function SkeletonTrackList({ count = 5, className = "" }: SkeletonTrackListProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTrackRow key={i} />
      ))}
    </div>
  );
}

// ============================================
// ERROR STATE
// ============================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't load this content. Please try again.", 
  onRetry,
  className = "" 
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircleIcon size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-surface-100 mb-2">{title}</h3>
      <p className="text-surface-400 text-sm max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          Try again
        </Button>
      )}
    </div>
  );
}

// ============================================
// EMPTY STATES
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, message, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {icon && (
        <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-100 mb-2">{title}</h3>
      <p className="text-surface-400 text-sm max-w-md mb-6">{message}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios

export function NoPlaylistsState({ onCreatePlaylist }: { onCreatePlaylist: () => void }) {
  return (
    <EmptyState
      icon={<PlaylistIcon size={40} className="text-surface-500" />}
      title="No playlists yet"
      message="Create your first playlist to start organizing your music."
      action={{ label: "Create Playlist", onClick: onCreatePlaylist }}
    />
  );
}

export function NoSearchResultsState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<SearchIcon size={40} className="text-surface-500" />}
      title="No results found"
      message={`We couldn't find anything matching "${query}". Try a different search.`}
    />
  );
}

export function NoTracksState() {
  return (
    <EmptyState
      icon={<MusicNoteIcon size={40} className="text-surface-500" />}
      title="No tracks"
      message="This playlist doesn't have any tracks yet."
    />
  );
}

// ============================================
// SECTION HEADER
// ============================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-surface-100">{title}</h2>
        {subtitle && <p className="text-sm text-surface-400 mt-1">{subtitle}</p>}
      </div>
      {action && (
        <Button variant="ghost" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
