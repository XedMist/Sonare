import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import * as searchApi from "../api/search";
import * as albumsApi from "../api/albums";
import { MediaCard } from "../components/shared/MediaCard";
import { TrackRow, TrackListHeader } from "../components/shared/TrackRow";
import { AddToPlaylistDialog } from "../components/shared/AddToPlaylistDialog";
import { 
  LoadingSection, 
  ErrorState, 
  SectionHeader,
  NoSearchResultsState,
  SkeletonGrid,
  SkeletonTrackList
} from "../components/shared/StateComponents";
import { Input } from "../components/ui";
import { SearchIcon, CloseIcon } from "../components/icons/Icons";
import type { Artist, Album, Track } from "../types";

// ============================================
// TYPES
// ============================================

interface SearchState {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

// ============================================
// SEARCH INPUT COMPONENT
// ============================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

function SearchInput({ value, onChange, onClear, isLoading }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative mb-8">
      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon size={20} className={isLoading ? "text-primary-500 animate-pulse" : "text-surface-400"} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full pl-12 pr-12 py-4 bg-surface-800 border border-surface-700 rounded-full text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-surface-100 transition-colors"
            aria-label="Clear search"
          >
            <CloseIcon size={20} />
          </button>
        )}
      </div>
      {value.length > 0 && value.length < 3 && (
        <p className="text-sm text-surface-500 mt-2 ml-4">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
}

// ============================================
// SEARCH RESULTS SECTIONS
// ============================================

interface ArtistsSectionProps {
  artists: Artist[];
}

function ArtistsSection({ artists }: ArtistsSectionProps) {
  if (artists.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader title="Artists" subtitle={`${artists.length} found`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {artists.slice(0, 6).map((artist) => (
          <MediaCard
            key={artist.id}
            type="artist"
            id={artist.id}
            name={artist.name}
            artwork={artist.image || undefined}
          />
        ))}
      </div>
    </section>
  );
}

interface AlbumsSectionProps {
  albums: Album[];
  onPlayAlbum: (albumId: string) => void;
}

function AlbumsSection({ albums, onPlayAlbum }: AlbumsSectionProps) {
  if (albums.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader title="Albums" subtitle={`${albums.length} found`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {albums.slice(0, 6).map((album) => (
          <MediaCard
            key={album.id}
            type="album"
            id={album.id}
            name={album.name}
            subtitle={album.artist?.name}
            artwork={album.cover}
            onPlay={() => onPlayAlbum(album.id)}
          />
        ))}
      </div>
    </section>
  );
}

interface TracksSectionProps {
  tracks: Track[];
  allTracks: Track[];
  onPlayTrack: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
}

function TracksSection({ tracks, allTracks, onPlayTrack, onAddToPlaylist }: TracksSectionProps) {
  const navigate = useNavigate();

  if (tracks.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader title="Tracks" subtitle={`${tracks.length} found`} />
      <div className="bg-surface-800/30 rounded-lg border border-surface-700/30 p-2">
        <TrackListHeader />
        {tracks.slice(0, 10).map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            onPlay={() => onPlayTrack(track)}
            actions={{
              onAddToPlaylist: () => onAddToPlaylist(track),
              onGoToAlbum: track.albumID ? () => navigate(`/app/albums/${track.albumID}`) : undefined,
            }}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================
// INITIAL STATE COMPONENT
// ============================================

function InitialSearchState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-surface-800 flex items-center justify-center mb-6">
        <SearchIcon size={48} className="text-surface-500" />
      </div>
      <h2 className="text-xl font-semibold text-surface-100 mb-2">
        Search for music
      </h2>
      <p className="text-surface-400 max-w-md">
        Find your favorite artists, albums, and tracks. Start typing above to begin your search.
      </p>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function AppSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { playTrack, playQueue } = usePlayer();
  
  // Get initial query from URL
  const initialQuery = searchParams.get("q") || "";
  
  // State
  const [query, setQuery] = useState(initialQuery);
  const [searchState, setSearchState] = useState<SearchState>({
    artists: [],
    albums: [],
    tracks: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================
  // SEARCH LOGIC
  // ============================================

  // ============================================
  // SEARCH LOGIC
  // ============================================

  // Ref for the current search request abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSearchState({
        artists: [],
        albums: [],
        tracks: [],
        isLoading: false,
        error: null,
        hasSearched: false,
      });
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSearchState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Pass the abort signal
      const results = await searchApi.search(searchQuery, "artist,album,track", controller.signal);
      
      // If initialized another request, this one is stale.
      // Check if this is still the current controller
      if (controller.signal.aborted) return;

      setSearchState({
        artists: results.artists || [],
        albums: results.albums || [],
        tracks: results.tracks || [],
        isLoading: false,
        error: null,
        hasSearched: true,
      });

      // Update URL with query
      setSearchParams({ q: searchQuery }, { replace: true });
    } catch (error) {
       if (controller.signal.aborted) return;
       
      console.error("Search failed:", error);
      setSearchState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Search failed. Please try again.",
        hasSearched: true,
      }));
    } finally {
        if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
        }
    }
  }, [setSearchParams]);

  // Debounced search effect
  useEffect(() => {
    // Cancel any pending search immediately when query changes
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      // We don't abort here because we want the request to finish if components unmounts? 
      // No, we should abort. But performSearch manages its own abort controller.
      // If we just clear timeout, performSearch won't run.
    };
  }, [query, performSearch]);

  // Search on initial load if query exists
  useEffect(() => {
    if (initialQuery.length >= 3 && !searchState.hasSearched) {
      performSearch(initialQuery);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // HANDLERS
  // ============================================

  const handleQueryChange = (value: string) => {
    setQuery(value);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearchParams({}, { replace: true });
    setSearchState({
      artists: [],
      albums: [],
      tracks: [],
      isLoading: false,
      error: null,
      hasSearched: false,
    });
  };

  const handlePlayAlbum = async (albumId: string) => {
    try {
      const tracksRes = await albumsApi.getAlbumTracks(albumId);
      if (tracksRes.data && tracksRes.data.length > 0) {
        playQueue(tracksRes.data, 0);
      }
    } catch (error) {
      console.error("Failed to play album:", error);
    }
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track, searchState.tracks);
  };

  const handleAddToPlaylist = (track: Track) => {
    setSelectedTrack(track);
    setIsPlaylistDialogOpen(true);
  };

  // ============================================
  // RENDER
  // ============================================

  const { artists, albums, tracks, isLoading, error, hasSearched } = searchState;
  const hasResults = artists.length > 0 || albums.length > 0 || tracks.length > 0;
  const showInitialState = !hasSearched && query.length < 3;
  const showNoResults = hasSearched && !hasResults && !isLoading;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-surface-100 mb-6">Search</h1>

      {/* Search Input */}
      <SearchInput
        value={query}
        onChange={handleQueryChange}
        onClear={handleClearSearch}
        isLoading={isLoading}
      />

      {/* Error State */}
      {error && (
        <ErrorState
          title="Search failed"
          message={error}
          onRetry={() => performSearch(query)}
        />
      )}

      {/* Initial State */}
      {showInitialState && <InitialSearchState />}

      {/* Loading State */}
      {isLoading && (
        <div>
          <section className="mb-8">
            <SectionHeader title="Searching..." />
            <SkeletonGrid count={6} />
          </section>
          <section className="mb-8">
            <SkeletonTrackList count={5} />
          </section>
        </div>
      )}

      {/* No Results */}
      {showNoResults && <NoSearchResultsState query={query} />}

      {/* Results */}
      {!isLoading && hasResults && (
        <>
          <ArtistsSection artists={artists} />
          <AlbumsSection albums={albums} onPlayAlbum={handlePlayAlbum} />
          <TracksSection
            tracks={tracks}
            allTracks={tracks}
            onPlayTrack={handlePlayTrack}
            onAddToPlaylist={handleAddToPlaylist}
          />
        </>
      )}

      {/* Add to Playlist Dialog */}
      <AddToPlaylistDialog
        open={isPlaylistDialogOpen}
        onOpenChange={setIsPlaylistDialogOpen}
        tracks={selectedTrack ? [selectedTrack] : []}
      />
    </div>
  );
}
