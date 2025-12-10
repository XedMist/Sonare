import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import * as albumsApi from "../api/albums";
import * as artistsApi from "../api/artists";
import { Button, Skeleton, SkeletonTrackRow } from "../components/ui";
import { Artwork } from "../components/ui/Avatar";
import { PlayIcon, ShuffleIcon, HeartIcon, MoreIcon } from "../components/icons/Icons";
import type { Album, Artist, Track } from "../types";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Album - Sonare" },
    { name: "description", content: "View album details on Sonare" },
  ];
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTotalDuration(tracks: Track[]): string {
  const totalSeconds = tracks.reduce((sum, track) => sum + track.duration, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} min`;
}

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, playQueue } = usePlayer();

  const [album, setAlbum] = useState<Album | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlbum() {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const [albumData, tracksRes] = await Promise.all([
          albumsApi.getAlbum(id),
          albumsApi.getAlbumTracks(id, { limit: 50 }),
        ]);

        setAlbum(albumData);
        setTracks(tracksRes.data || []);

        // Fetch artist info
        if (albumData.artistID) {
          try {
            const artistData = await artistsApi.getArtist(albumData.artistID);
            setArtist(artistData);
          } catch {
            // Artist fetch failed, use fallback
          }
        }
      } catch (err) {
        console.error("Failed to fetch album:", err);
        setError("Failed to load album. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlbum();
  }, [id]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playQueue(tracks);
    }
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playQueue(shuffled);
    }
  };

  const handlePlayTrack = (track: Track, index: number) => {
    playQueue(tracks, index);
  };

  // Get the first track's thumbnail as album artwork
  const albumArtwork = tracks[0]?.thumbnail || null;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          <Skeleton className="w-48 h-48 md:w-56 md:h-56 rounded-lg flex-shrink-0" />
          <div className="flex-1 text-center md:text-left">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Tracks skeleton */}
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonTrackRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-400 mb-4">{error || "Album not found"}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Album header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-6">
        <Artwork
          src={albumArtwork}
          alt={album.name}
          className="w-48 h-48 md:w-56 md:h-56 shadow-2xl flex-shrink-0"
          rounded="lg"
          size="full"
        />
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-medium text-surface-400 uppercase tracking-wide mb-2">
            Album
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-surface-100 mb-4">
            {album.name}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-surface-300">
            {artist && (
              <Link
                to={`/app/artists/${artist.id}`}
                className="font-medium hover:text-surface-100 hover:underline"
              >
                {artist.name}
              </Link>
            )}
            {!artist && album.artist && (
              <Link
                to={`/app/artists/${album.artist.id}`}
                className="font-medium hover:text-surface-100 hover:underline"
              >
                {album.artist.name}
              </Link>
            )}
            <span className="text-surface-500">•</span>
            <span>{tracks.length} songs</span>
            <span className="text-surface-500">•</span>
            <span>{formatTotalDuration(tracks)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 mb-6">
        <Button size="lg" onClick={handlePlayAll} disabled={tracks.length === 0}>
          <PlayIcon size={24} />
          Play
        </Button>
        <Button variant="secondary" size="lg" onClick={handleShuffle} disabled={tracks.length === 0}>
          <ShuffleIcon size={20} />
        </Button>
        <button
          className="p-2 text-surface-400 hover:text-surface-100 transition-colors"
          aria-label="Save to library"
        >
          <HeartIcon size={24} />
        </button>
      </div>

      {/* Tracks list */}
      {tracks.length > 0 ? (
        <div>
          {/* Table header */}
          <div className="flex items-center gap-4 px-2 py-2 text-sm text-surface-400 border-b border-surface-700 mb-2">
            <div className="w-8 text-center">#</div>
            <div className="flex-1">Title</div>
            <div className="w-16 text-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
          </div>

          {/* Track rows */}
          <div className="space-y-1">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-surface-700 group cursor-pointer"
                onClick={() => handlePlayTrack(track, index)}
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

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-100 truncate">
                    {track.name}
                  </p>
                  {artist && (
                    <p className="text-sm text-surface-400 truncate">
                      {artist.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <button
                  className="p-2 text-surface-400 hover:text-surface-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Like"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HeartIcon size={16} />
                </button>

                {/* Duration */}
                <span className="text-sm text-surface-400 w-12 text-right">
                  {formatDuration(track.duration)}
                </span>

                {/* More menu */}
                <button
                  className="p-2 text-surface-400 hover:text-surface-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="More options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-surface-400">No tracks in this album</p>
        </div>
      )}
    </div>
  );
}
