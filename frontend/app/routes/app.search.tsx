import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import * as artistsApi from "../api/artists";
import * as albumsApi from "../api/albums";
import * as tracksApi from "../api/tracks";
import { Card, SkeletonCard, SkeletonTrackRow } from "../components/ui";
import { Artwork } from "../components/ui/Avatar";
import { SearchIcon, PlayIcon } from "../components/icons/Icons";
import type { Artist, Album, Track } from "../types";
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

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { playTrack, playQueue } = usePlayer();

  const query = searchParams.get("q") || "";
  const debouncedQuery = useDebounce(query, 300);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function search() {
      if (!debouncedQuery.trim()) {
        setTracks([]);
        setArtists([]);
        setAlbums([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        // Fetch all data in parallel
        const [tracksRes, artistsRes, albumsRes] = await Promise.all([
          tracksApi.getTracks({ name: debouncedQuery, limit: 20 }),
          artistsApi.getArtists({ limit: 50 }), // No search endpoint, fetch all and filter
          albumsApi.getAlbums({ limit: 50 }), // No search endpoint, fetch all and filter
        ]);

        setTracks(tracksRes.data || []);

        // Client-side filtering for artists and albums
        const lowerQuery = debouncedQuery.toLowerCase();
        setArtists(
          (artistsRes.data || []).filter((a) =>
            a.name.toLowerCase().includes(lowerQuery)
          ).slice(0, 6)
        );
        setAlbums(
          (albumsRes.data || []).filter((a) =>
            a.name.toLowerCase().includes(lowerQuery)
          ).slice(0, 6)
        );
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

  const handlePlayTrack = (track: Track) => {
    playTrack(track, tracks);
  };

  const hasResults = tracks.length > 0 || artists.length > 0 || albums.length > 0;

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
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-surface-100 mb-4">Songs</h2>
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTrackRow key={i} />
              ))}
            </div>
          </section>
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

      {/* Results */}
      {!isLoading && hasResults && (
        <div className="space-y-8">
          {/* Artists */}
          {artists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-surface-100 mb-4">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {artists.map((artist) => (
                  <Card
                    key={artist.id}
                    hover
                    className="group"
                    onClick={() => navigate(`/app/artists/${artist.id}`)}
                  >
                    <Artwork
                      alt={artist.name}
                      size="full"
                      rounded="full"
                      className="mb-3 shadow-lg"
                    />
                    <h3 className="font-medium text-surface-100 truncate">{artist.name}</h3>
                    <p className="text-sm text-surface-400">Artist</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {albums.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-surface-100 mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {albums.map((album) => (
                  <Card
                    key={album.id}
                    hover
                    className="group"
                    onClick={() => navigate(`/app/albums/${album.id}`)}
                  >
                    <div className="relative mb-3">
                      <Artwork
                        alt={album.name}
                        size="full"
                        rounded="md"
                        className="shadow-lg"
                      />
                    </div>
                    <h3 className="font-medium text-surface-100 truncate">{album.name}</h3>
                    <p className="text-sm text-surface-400 truncate">
                      {album.artist?.name || "Unknown Artist"}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Tracks */}
          {tracks.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-surface-100 mb-4">Songs</h2>
              <div className="space-y-1">
                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-surface-700 group cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {/* Track number / play button */}
                    <div className="w-8 text-center">
                      <span className="text-surface-400 group-hover:hidden">
                        {index + 1}
                      </span>
                      <button
                        className="hidden group-hover:block text-surface-100"
                        aria-label={`Play ${track.name}`}
                      >
                        <PlayIcon size={16} />
                      </button>
                    </div>

                    {/* Track artwork */}
                    <Artwork
                      src={track.thumbnail}
                      alt={track.name}
                      size="sm"
                      rounded="sm"
                    />

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-100 truncate">
                        {track.name}
                      </p>
                      <p className="text-sm text-surface-400 truncate">
                        {track.album?.name || "Unknown Album"}
                      </p>
                    </div>

                    {/* Duration */}
                    <span className="text-sm text-surface-400">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
