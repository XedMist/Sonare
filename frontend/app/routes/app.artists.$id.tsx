import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import * as artistsApi from "../api/artists";
import * as albumsApi from "../api/albums";
import { MediaCard } from "../components/shared/MediaCard";
import { TrackRow, TrackListHeader } from "../components/shared/TrackRow";
import { AddToPlaylistDialog } from "../components/shared/AddToPlaylistDialog";
import { 
  LoadingSection, 
  ErrorState, 
  SectionHeader,
  SkeletonGrid,
  SkeletonTrackList,
  EmptyState
} from "../components/shared/StateComponents";
import { Button, Artwork } from "../components/ui";
import { PlayIcon, ShuffleIcon, BackIcon, ArtistIcon, MusicNoteIcon } from "../components/icons/Icons";
import { getTrackThumbnailUrl } from "../api/tracks";
import type { Artist, Album, Track } from "../types";

// ============================================
// TYPES
// ============================================

interface ArtistData {
  artist: Artist | null;
  albums: Album[];
  tracks: Track[];
}

type LoadingState = "loading" | "error" | "success";

// ============================================
// ARTIST HERO SECTION
// ============================================

interface ArtistHeroProps {
  artist: Artist;
  tracksCount: number;
  albumsCount: number;
  onPlayAll: () => void;
  onShuffle: () => void;
  onBack: () => void;
}

function ArtistHero({ artist, tracksCount, albumsCount, onPlayAll, onShuffle, onBack }: ArtistHeroProps) {
  return (
    <div className="relative mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/20 via-surface-900/50 to-surface-900 rounded-xl -z-10" />
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 rounded-full bg-surface-800/80 hover:bg-surface-700 transition-colors z-10"
        aria-label="Go back"
      >
        <BackIcon size={20} className="text-surface-100" />
      </button>
      
      {/* Content */}
      <div className="p-6 pt-16 md:p-8 md:pt-16">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Artist Avatar */}
          <div className="relative">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/20">
              <ArtistIcon size={80} className="text-white/80" />
            </div>
          </div>
          
          {/* Artist Info */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-2">
              Artist
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-surface-100 mb-4">
              {artist.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-surface-400 text-sm">
              <span>{albumsCount} albums</span>
              <span>•</span>
              <span>{tracksCount} tracks</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
          <Button onClick={onPlayAll} size="lg" className="gap-2">
            <PlayIcon size={20} />
            Play All
          </Button>
          <Button onClick={onShuffle} variant="secondary" size="lg" className="gap-2">
            <ShuffleIcon size={20} />
            Shuffle
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ALBUMS SECTION
// ============================================

interface AlbumsSectionProps {
  albums: Album[];
  onPlayAlbum: (albumId: string) => void;
  isLoading: boolean;
}

function AlbumsSection({ albums, onPlayAlbum, isLoading }: AlbumsSectionProps) {
  if (isLoading) {
    return (
      <section className="mb-8">
        <SectionHeader title="Albums" />
        <SkeletonGrid count={6} />
      </section>
    );
  }

  if (albums.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader title="Albums" subtitle={`${albums.length} albums`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {albums.map((album) => (
          <MediaCard
            key={album.id}
            type="album"
            id={album.id}
            name={album.name}
            subtitle={album.artist?.name}
            artwork={getTrackThumbnailUrl(album.id)}
            onPlay={() => onPlayAlbum(album.id)}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================
// TRACKS SECTION
// ============================================

interface TracksSectionProps {
  tracks: Track[];
  onPlayTrack: (track: Track, index: number) => void;
  onAddToPlaylist: (track: Track) => void;
  isLoading: boolean;
}

function TracksSection({ tracks, onPlayTrack, onAddToPlaylist, isLoading }: TracksSectionProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="mb-8">
        <SectionHeader title="Tracks" />
        <SkeletonTrackList count={5} />
      </section>
    );
  }

  if (tracks.length === 0) {
    return (
      <section className="mb-8">
        <SectionHeader title="Tracks" />
        <EmptyState
          icon={<MusicNoteIcon size={40} className="text-surface-500" />}
          title="No tracks"
          message="This artist has no tracks yet."
        />
      </section>
    );
  }

  return (
    <section className="mb-8">
      <SectionHeader title="Tracks" subtitle={`${tracks.length} tracks`} />
      <div className="bg-surface-800/30 rounded-lg border border-surface-700/30 p-2">
        <TrackListHeader />
        {tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            onPlay={() => onPlayTrack(track, index)}
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
// MAIN PAGE COMPONENT
// ============================================

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

  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoadingState("loading");
    try {
      const [artist, albumsRes, tracksRes] = await Promise.all([
        artistsApi.getArtist(id),
        artistsApi.getArtistAlbums(id, { limit: 50 }),
        artistsApi.getArtistTracks(id, { limit: 100 }),
      ]);

      setData({
        artist,
        albums: albumsRes.data || [],
        tracks: tracksRes.data || [],
      });
      setLoadingState("success");
    } catch (error) {
      console.error("Failed to fetch artist:", error);
      setLoadingState("error");
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleBack = () => {
    navigate(-1);
  };

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

  const handleAddToPlaylist = (track: Track) => {
    setSelectedTrack(track);
    setIsPlaylistDialogOpen(true);
  };

  // ============================================
  // RENDER
  // ============================================

  if (loadingState === "loading") {
    return <LoadingSection message="Loading artist..." />;
  }

  if (loadingState === "error" || !data.artist) {
    return (
      <ErrorState
        title="Artist not found"
        message="We couldn't find this artist. It may have been removed."
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Artist header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <Avatar
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
