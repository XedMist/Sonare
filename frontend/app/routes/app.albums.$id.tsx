import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import * as albumsApi from "../api/albums";
import { TrackRow, TrackListHeader } from "../components/shared/TrackRow";
import { AddToPlaylistDialog } from "../components/shared/AddToPlaylistDialog";
import { 
  LoadingSection, 
  ErrorState, 
  EmptyState
} from "../components/shared/StateComponents";
import { Button, Artwork } from "../components/ui";
import { PlayIcon, ShuffleIcon, BackIcon, MusicNoteIcon, AlbumIcon } from "../components/icons/Icons";
import type { Album, Track } from "../types";

// ============================================
// TYPES
// ============================================

interface AlbumData {
  album: Album | null;
  tracks: Track[];
}

type LoadingState = "loading" | "error" | "success";

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} min`;
}

function getTotalDuration(tracks: Track[]): number {
  return tracks.reduce((total, track) => total + (track.duration || 0), 0);
}

// ============================================
// ALBUM HERO SECTION
// ============================================

interface AlbumHeroProps {
  album: Album;
  tracks: Track[];
  onPlayAll: () => void;
  onShuffle: () => void;
  onBack: () => void;
}

function AlbumHero({ album, tracks, onPlayAll, onShuffle, onBack }: AlbumHeroProps) {
  const navigate = useNavigate();
  const totalDuration = getTotalDuration(tracks);
  const firstTrack = tracks[0];

  return (
    <div className="relative mb-8">
      {/* Background gradient with blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-surface-900/80 to-surface-900 rounded-xl -z-10" />
      
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
          {/* Album Artwork */}
          <div className="relative group">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-lg shadow-2xl shadow-black/40 overflow-hidden">
              {firstTrack?.thumbnail ? (
                <Artwork
                  src={firstTrack.thumbnail}
                  alt={album.name}
                  size="full"
                  rounded="lg"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-surface-700 to-surface-800 flex items-center justify-center">
                  <AlbumIcon size={64} className="text-surface-500" />
                </div>
              )}
            </div>
            
            {/* Play overlay on hover */}
            <button
              onClick={onPlayAll}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
              aria-label={`Play ${album.name}`}
            >
              <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center shadow-xl">
                <PlayIcon size={28} className="text-surface-900 ml-1" />
              </div>
            </button>
          </div>
          
          {/* Album Info */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-2">
              Album
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-surface-100 mb-3">
              {album.name}
            </h1>
            
            {/* Artist link */}
            {album.artist && (
              <Link
                to={`/app/artists/${album.artistID}`}
                className="text-lg text-surface-200 hover:text-primary-400 hover:underline transition-colors"
              >
                {album.artist.name}
              </Link>
            )}
            
            {/* Album stats */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-surface-400 text-sm mt-3">
              <span>{tracks.length} tracks</span>
              <span>•</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
          <Button onClick={onPlayAll} size="lg" className="gap-2" disabled={tracks.length === 0}>
            <PlayIcon size={20} />
            Play
          </Button>
          <Button onClick={onShuffle} variant="secondary" size="lg" className="gap-2" disabled={tracks.length === 0}>
            <ShuffleIcon size={20} />
            Shuffle
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TRACKS LIST SECTION
// ============================================

interface TracksListProps {
  tracks: Track[];
  onPlayTrack: (track: Track, index: number) => void;
  onAddToPlaylist: (track: Track) => void;
}

function TracksList({ tracks, onPlayTrack, onAddToPlaylist }: TracksListProps) {
  const navigate = useNavigate();

  if (tracks.length === 0) {
    return (
      <EmptyState
        icon={<MusicNoteIcon size={40} className="text-surface-500" />}
        title="No tracks"
        message="This album doesn't have any tracks yet."
      />
    );
  }

  return (
    <div className="bg-surface-800/30 rounded-lg border border-surface-700/30 p-2">
      <TrackListHeader showArtwork={false} />
      {tracks.map((track, index) => (
        <TrackRow
          key={track.id}
          track={track}
          index={index}
          onPlay={() => onPlayTrack(track, index)}
          showArtwork={false}
          actions={{
            onAddToPlaylist: () => onAddToPlaylist(track),
            onGoToArtist: track.album?.artistID 
              ? () => navigate(`/app/artists/${track.album?.artistID}`) 
              : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, playQueue } = usePlayer();

  // State
  const [data, setData] = useState<AlbumData>({
    album: null,
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
      const [album, tracksRes] = await Promise.all([
        albumsApi.getAlbum(id),
        albumsApi.getAlbumTracks(id, { limit: 100 }),
      ]);

      setData({
        album,
        tracks: tracksRes.data || [],
      });
      setLoadingState("success");
    } catch (error) {
      console.error("Failed to fetch album:", error);
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
      const shuffled = [...data.tracks].sort(() => Math.random() - 0.5);
      playQueue(shuffled, 0);
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
    return <LoadingSection message="Loading album..." />;
  }

  if (loadingState === "error" || !data.album) {
    return (
      <ErrorState
        title="Album not found"
        message="We couldn't find this album. It may have been removed."
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <AlbumHero
        album={data.album}
        tracks={data.tracks}
        onPlayAll={handlePlayAll}
        onShuffle={handleShuffle}
        onBack={handleBack}
      />

      {/* Tracks List */}
      <TracksList
        tracks={data.tracks}
        onPlayTrack={handlePlayTrack}
        onAddToPlaylist={handleAddToPlaylist}
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
