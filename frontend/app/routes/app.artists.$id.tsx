import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import * as artistsApi from "../api/artists";
import { Button, Skeleton, SkeletonTrackRow } from "../components/ui";
import { Avatar, Artwork } from "../components/ui/Avatar";
import { PlayIcon, ShuffleIcon } from "../components/icons/Icons";
import type { Artist, Album, Track } from "../types";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Artist - Sonare" },
    { name: "description", content: "View artist details on Sonare" },
  ];
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, playQueue } = usePlayer();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [singles, setSingles] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtist() {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const [artistData, albumsRes, tracksRes, singlesRes] = await Promise.all([
          artistsApi.getArtist(id),
          artistsApi.getArtistAlbums(id, { limit: 20 }),
          artistsApi.getArtistTracks(id, { limit: 10 }),
          artistsApi.getArtistSingles(id, { limit: 20 }),
        ]);

        setArtist(artistData);
        setAlbums(albumsRes.data || []);
        setTracks(tracksRes.data || []);
        setSingles(singlesRes.data || []);
      } catch (err) {
        console.error("Failed to fetch artist:", err);
        setError("Failed to load artist. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtist();
  }, [id]);

  const handlePlayAll = () => {
    const allTracks = [...tracks, ...singles];
    if (allTracks.length > 0) {
      playQueue(allTracks);
    }
  };

  const handleShuffle = () => {
    const allTracks = [...tracks, ...singles];
    if (allTracks.length > 0) {
      const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
      playQueue(shuffled);
    }
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track, tracks);
  };

  const handlePlaySingle = (track: Track) => {
    playTrack(track, singles);
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          <Skeleton className="w-48 h-48 rounded-full flex-shrink-0" />
          <div className="flex-1 text-center md:text-left">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Tracks skeleton */}
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonTrackRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-400 mb-4">{error || "Artist not found"}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Artist header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <Avatar
          src={artist.image}
          alt={artist.name}
          size="xl"
          className="w-48 h-48 shadow-2xl"
        />
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-medium text-surface-400 uppercase tracking-wide mb-2">
            Artist
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-surface-100 mb-4">
            {artist.name}
          </h1>
          <p className="text-surface-400">
            {albums.length} albums • {singles.length} singles • {tracks.length} tracks
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 mb-8">
        <Button size="lg" onClick={handlePlayAll} disabled={tracks.length === 0 && singles.length === 0}>
          <PlayIcon size={24} />
          Play
        </Button>
        <Button variant="secondary" size="lg" onClick={handleShuffle} disabled={tracks.length === 0 && singles.length === 0}>
          <ShuffleIcon size={20} />
          Shuffle
        </Button>
      </div>

      {/* Popular tracks */}
      {tracks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-surface-100 mb-4">
            Popular tracks
          </h2>
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

      {/* Albums */}
      {albums.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-surface-100 mb-4">
            Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-surface-800 rounded-lg p-4 hover:bg-surface-700 transition-colors cursor-pointer group"
                onClick={() => navigate(`/app/albums/${album.id}`)}
              >
                <div className="relative mb-3">
                  <Artwork
                    src={album.cover}
                    alt={album.name}
                    size="full"
                    rounded="md"
                    className="shadow-lg"
                  />
                </div>
                <h3 className="font-medium text-surface-100 truncate">
                  {album.name}
                </h3>
                <p className="text-sm text-surface-400">Album</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Singles */}
      {singles.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-surface-100 mb-4">
            Singles
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {singles.map((single) => (
              <div
                key={single.id}
                className="bg-surface-800 rounded-lg p-4 hover:bg-surface-700 transition-colors cursor-pointer group"
                onClick={() => handlePlaySingle(single)}
              >
                <div className="relative mb-3">
                  <Artwork
                    src={single.thumbnail}
                    alt={single.name}
                    size="full"
                    rounded="md"
                    className="shadow-lg"
                  />
                  {/* Play button overlay */}
                  <button
                    className="absolute bottom-2 right-2 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySingle(single);
                    }}
                    aria-label={`Play ${single.name}`}
                  >
                    <PlayIcon size={20} className="text-surface-900 ml-0.5" />
                  </button>
                </div>
                <h3 className="font-medium text-surface-100 truncate">
                  {single.name}
                </h3>
                <p className="text-sm text-surface-400">Single</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
