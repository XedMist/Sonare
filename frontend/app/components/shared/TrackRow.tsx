import { memo } from "react";
import { Link } from "react-router";
import { Artwork } from "../ui/Avatar";
import { PlayIcon, HeartIcon, MoreIcon } from "../icons/Icons";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "../ui";
import type { Track } from "../../types";

interface TrackRowProps {
  track: Track;
  index: number;
  onPlay: () => void;
  showArtwork?: boolean;
  actions?: {
    onAddToPlaylist?: () => void;
    onRemoveFromPlaylist?: () => void;
    onGoToAlbum?: () => void;
    onGoToArtist?: () => void;
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Memoized TrackRow to prevent unnecessary re-renders in lists
export const TrackRow = memo(function TrackRow({ track, index, onPlay, showArtwork = true, actions }: TrackRowProps) {
  const artworkSrc = track.thumbnail || track.album?.cover || undefined;

  return (
    <div
      className="track-row group"
      onClick={onPlay}
    >
      <div className="w-8 text-center">
        <span className="text-surface-400 group-hover:hidden">{index + 1}</span>
        <button className="hidden group-hover:block text-surface-100" aria-label={`Play ${track.name}`}>
          <PlayIcon size={16} />
        </button>
      </div>

      {showArtwork && (
        <Artwork 
          src={artworkSrc} 
          alt={track.name} 
          size="sm" 
          rounded="sm"
          loading="lazy"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-100 truncate">{track.name}</p>
        {track.album?.name && (
          <p className="text-sm text-surface-400 truncate">
            {track.album.name}
          </p>
        )}
      </div>

      <button
        className="p-2 text-surface-400 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Like"
        onClick={(e) => e.stopPropagation()}
      >
        <HeartIcon size={16} />
      </button>

      <span className="text-sm text-surface-400 w-12 text-right">
        {formatDuration(track.duration)}
      </span>

      {actions && (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu
            trigger={
              <button
                className="p-2 text-surface-400 hover:text-surface-100 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="More options"
              >
                <MoreIcon size={16} />
              </button>
            }
          >
            {actions.onAddToPlaylist && (
              <DropdownItem onClick={actions.onAddToPlaylist}>
                Add to playlist
              </DropdownItem>
            )}
            {actions.onGoToAlbum && track.albumID && (
              <DropdownItem onClick={actions.onGoToAlbum}>
                Go to album
              </DropdownItem>
            )}
            {actions.onGoToArtist && track.album?.artistID && (
              <DropdownItem onClick={actions.onGoToArtist}>
                Go to artist
              </DropdownItem>
            )}
            {actions.onRemoveFromPlaylist && (
              <>
                <DropdownSeparator />
                <DropdownItem onClick={actions.onRemoveFromPlaylist} destructive>
                  Remove from playlist
                </DropdownItem>
              </>
            )}
          </DropdownMenu>
        </div>
      )}
    </div>
  );
});

interface TrackListHeaderProps {
  showArtwork?: boolean;
}

export function TrackListHeader({ showArtwork = true }: TrackListHeaderProps) {
  return (
    <div className="flex items-center gap-4 px-2 py-2 text-sm text-surface-400 border-b border-surface-700 mb-2">
      <div className="w-8 text-center">#</div>
      {showArtwork && <div className="w-10" />}
      <div className="flex-1">Title</div>
      <div className="w-12" />
      <div className="w-12 text-right">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
      </div>
      <div className="w-8" />
    </div>
  );
}
