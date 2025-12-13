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
            {artist.image ? (
              <img
                src={artist.image}
                alt={artist.name}
                className="w-40 h-40 md:w-52 md:h-52 rounded-full object-cover shadow-2xl shadow-primary-500/20"
              />
            ) : (
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/20">
                <ArtistIcon size={80} className="text-white/80" />
              </div>
            )}
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
            artwork={album.cover}
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

  // State
  const [data, setData] = useState<ArtistData>({
    artist: null,
    albums: [],
    tracks: [],
  });
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================

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
    if (data.tracks.length > 0) {
      playQueue(data.tracks, 0);
    }
  };

  const handleShuffle = () => {
    if (data.tracks.length > 0) {
      // Shuffle the tracks
      const shuffled = [...data.tracks].sort(() => Math.random() - 0.5);
      playQueue(shuffled, 0);
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

  const handlePlayTrack = (track: Track, index: number) => {
    playTrack(track, data.tracks);
  };

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
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <ArtistHero
        artist={data.artist}
        tracksCount={data.tracks.length}
        albumsCount={data.albums.length}
        onPlayAll={handlePlayAll}
        onShuffle={handleShuffle}
        onBack={handleBack}
      />

      {/* Albums Section */}
      <AlbumsSection
        albums={data.albums}
        onPlayAlbum={handlePlayAlbum}
        isLoading={false}
      />

      {/* Tracks Section */}
      <TracksSection
        tracks={data.tracks}
        onPlayTrack={handlePlayTrack}
        onAddToPlaylist={handleAddToPlaylist}
        isLoading={false}
      />

      {/* Add to Playlist Dialog */}
      <AddToPlaylistDialog
        open={isPlaylistDialogOpen}
        onOpenChange={setIsPlaylistDialogOpen}
        tracks={selectedTrack ? [selectedTrack] : []}
      />
    </div>
  );
}
