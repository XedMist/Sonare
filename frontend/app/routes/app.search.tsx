import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import * as searchApi from "../api/search";
import type { UnifiedSearchItem } from "../api/search";
import { SkeletonTrackRow } from "../components/ui";
import { Artwork } from "../components/ui/Avatar";
import { SearchIcon, PlayIcon } from "../components/icons/Icons";
import { User, Disc3, Music } from "lucide-react";
import type { Track } from "../types";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search - Sonare" },
    { name: "description", content: "Search for music on Sonare" },
  ];
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Type badge component
function TypeBadge({ type }: { type: 'artist' | 'album' | 'track' }) {
  const config = {
    artist: { icon: User, label: 'Artist', color: 'bg-purple-500/20 text-purple-300' },
    album: { icon: Disc3, label: 'Album', color: 'bg-blue-500/20 text-blue-300' },
    track: { icon: Music, label: 'Song', color: 'bg-green-500/20 text-green-300' },
  };

  const { icon: Icon, label, color } = config[type];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

// Unified search result row
function SearchResultRow({
  item,
  onPlay,
  onClick,
}: {
  item: UnifiedSearchItem;
  onPlay?: () => void;
  onClick: () => void;
}) {
  // Get image, title, and subtitle based on item type
  let image: string | undefined;
  let title: string;
  let subtitle: string;
  let duration: number | undefined;
  let isRounded = false;

  if (item.type === 'artist' && item.artist) {
    image = item.artist.image || undefined;
    title = item.artist.name;
    subtitle = item.artist.genres?.slice(0, 2).join(', ') || 'Artist';
    isRounded = true;
  } else if (item.type === 'album' && item.album) {
    image = item.album.cover;
    title = item.album.name;
    subtitle = item.album.artist?.name || 'Unknown Artist';
  } else if (item.type === 'track' && item.track) {
    image = item.track.thumbnail;
    title = item.track.name;
    subtitle = item.track.album?.name || 'Unknown Album';
    duration = item.track.duration;
  } else {
    title = item.name;
    subtitle = item.type;
  }

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-700 group cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Type badge */}
      <div className="w-16 flex-shrink-0">
        <TypeBadge type={item.type} />
      </div>

      {/* Artwork */}
      <Artwork
        src={image}
        alt={title}
        size="sm"
        rounded={isRounded ? "full" : "sm"}
        className="flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-100 truncate">{title}</p>
        <p className="text-sm text-surface-400 truncate">{subtitle}</p>
      </div>

      {/* Duration (for tracks only) */}
      {duration !== undefined && (
        <span className="text-sm text-surface-400 flex-shrink-0">
          {formatDuration(duration)}
        </span>
      )}

      {/* Play button for tracks */}
      {item.type === 'track' && onPlay && (
        <button
          className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-primary-500 text-surface-900 hover:bg-primary-400 transition-all flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          aria-label={`Play ${title}`}
        >
          <PlayIcon size={14} />
        </button>
      )}
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { playTrack, playQueue } = usePlayer();

  const query = searchParams.get("q") || "";
  const debouncedQuery = useDebounce(query, 300);

  const [results, setResults] = useState<UnifiedSearchItem[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function search() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setAllTracks([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await searchApi.searchUnified(debouncedQuery);
        setResults(response.items || []);
        
        // Extract all tracks for playback context
        const tracks = response.items
          .filter((item): item is UnifiedSearchItem & { track: Track } => 
            item.type === 'track' && !!item.track
          )
          .map(item => item.track);
        setAllTracks(tracks);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [debouncedQuery]);

  const handleQueryChange = (value: string) => {
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleItemClick = (item: UnifiedSearchItem) => {
    if (item.type === 'artist') {
      navigate(`/app/artists/${item.id}`);
    } else if (item.type === 'album') {
      navigate(`/app/albums/${item.id}`);
    } else if (item.type === 'track' && item.track) {
      playTrack(item.track, allTracks);
    }
  };

  const handlePlayTrack = (item: UnifiedSearchItem) => {
    if (item.type === 'track' && item.track) {
      playTrack(item.track, allTracks);
    }
  };

  const hasResults = results.length > 0;

  return (
    <div className="animate-fade-in">
      {/* Search input */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full pl-12 pr-4 py-3 bg-surface-700 border border-surface-600 rounded-full text-surface-100 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleQueryChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-100"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonTrackRow key={i} />
          ))}
        </div>
      )}

      {/* No query state */}
      {!query && !isLoading && (
        <div className="text-center py-12">
          <SearchIcon size={64} className="mx-auto text-surface-600 mb-4" />
          <h2 className="text-xl font-bold text-surface-100 mb-2">
            Search Sonare
          </h2>
          <p className="text-surface-400">
            Find your favorite songs, artists, and albums
          </p>
        </div>
      )}

      {/* No results state */}
      {hasSearched && !isLoading && !hasResults && (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-surface-100 mb-2">
            No results found for "{debouncedQuery}"
          </h2>
          <p className="text-surface-400">
            Please make sure your words are spelled correctly, or use fewer or different keywords.
          </p>
        </div>
      )}

      {/* Unified Results */}
      {!isLoading && hasResults && (
        <div className="space-y-1">
          {results.map((item) => (
            <SearchResultRow
              key={`${item.type}-${item.id}`}
              item={item}
              onClick={() => handleItemClick(item)}
              onPlay={item.type === 'track' ? () => handlePlayTrack(item) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
