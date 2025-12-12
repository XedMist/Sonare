import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import * as playlistsApi from "../api/playlists";
import { TrackRow, TrackListHeader } from "../components/shared/TrackRow";
import { AddToPlaylistDialog } from "../components/shared/AddToPlaylistDialog";
import { 
  LoadingSection, 
  ErrorState, 
  NoTracksState
} from "../components/shared/StateComponents";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  Input,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator
} from "../components/ui";
import { 
  PlayIcon, 
  ShuffleIcon, 
  BackIcon, 
  PlaylistIcon, 
  EditIcon, 
  DeleteIcon,
  MoreIcon,
  PlusIcon
} from "../components/icons/Icons";
import { getTrackThumbnailUrl } from "../api/tracks";
import type { Playlist, Track } from "../types";

// ============================================
// TYPES
// ============================================

interface PlaylistData {
  playlist: Playlist | null;
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
// RENAME PLAYLIST DIALOG
// ============================================

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (newName: string) => Promise<void>;
}

function RenameDialog({ open, onOpenChange, currentName, onRename }: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentName);
    setError(null);
  }, [currentName, open]);

  const handleRename = async () => {
    if (!name.trim() || name.trim() === currentName) {
      onOpenChange(false);
      return;
    }

    try {
      setIsRenaming(true);
      setError(null);
      await onRename(name.trim());
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to rename playlist:", err);
      setError("Failed to rename playlist. Please try again.");
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          Rename playlist
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} isLoading={isRenaming} disabled={!name.trim()}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DELETE CONFIRMATION DIALOG
// ============================================

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistName: string;
  onDelete: () => Promise<void>;
}

function DeleteDialog({ open, onOpenChange, playlistName, onDelete }: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to delete playlist:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          Delete playlist
        </DialogHeader>
        <div className="py-4">
          <p className="text-surface-300">
            Are you sure you want to delete <strong className="text-surface-100">"{playlistName}"</strong>?
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// PLAYLIST HERO SECTION
// ============================================

interface PlaylistHeroProps {
  playlist: Playlist;
  tracks: Track[];
  isOwner: boolean;
  onPlayAll: () => void;
  onShuffle: () => void;
  onBack: () => void;
  onRename: () => void;
  onDelete: () => void;
}

function PlaylistHero({ 
  playlist, 
  tracks, 
  isOwner,
  onPlayAll, 
  onShuffle, 
  onBack,
  onRename,
  onDelete 
}: PlaylistHeroProps) {
  const totalDuration = getTotalDuration(tracks);
  const firstTrackId = tracks[0]?.id;

  return (
    <div className="relative mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-600/15 via-surface-900/70 to-surface-900 rounded-xl -z-10" />
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 rounded-full bg-surface-800/80 hover:bg-surface-700 transition-colors z-10"
        aria-label="Go back"
      >
        <BackIcon size={20} className="text-surface-100" />
      </button>

      {/* More options menu */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-10">
          <DropdownMenu
            trigger={
              <button
                className="p-2 rounded-full bg-surface-800/80 hover:bg-surface-700 transition-colors"
                aria-label="More options"
              >
                <MoreIcon size={20} className="text-surface-100" />
              </button>
            }
          >
            <DropdownItem onClick={onRename}>
              <EditIcon size={16} className="mr-2" />
              Rename playlist
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={onDelete} destructive>
              <DeleteIcon size={16} className="mr-2" />
              Delete playlist
            </DropdownItem>
          </DropdownMenu>
        </div>
      )}
      
      {/* Content */}
      <div className="p-6 pt-16 md:p-8 md:pt-16">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Playlist Artwork */}
          <div className="relative">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-lg shadow-2xl shadow-black/40 overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700">
              {firstTrackId ? (
                <img
                  src={getTrackThumbnailUrl(firstTrackId)}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlaylistIcon size={64} className="text-white/60" />
                </div>
              )}
            </div>
          </div>
          
          {/* Playlist Info */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-2">
              Playlist
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-surface-100 mb-3">
              {playlist.name}
            </h1>
            
            {/* Playlist stats */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-surface-400 text-sm">
              <span>{tracks.length} tracks</span>
              {tracks.length > 0 && (
                <>
                  <span>•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </>
              )}
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
  isOwner: boolean;
  onPlayTrack: (track: Track, index: number) => void;
  onAddToPlaylist: (track: Track) => void;
  onRemoveFromPlaylist: (track: Track) => void;
}

function TracksList({ tracks, isOwner, onPlayTrack, onAddToPlaylist, onRemoveFromPlaylist }: TracksListProps) {
  const navigate = useNavigate();

  if (tracks.length === 0) {
    return <NoTracksState />;
  }

  return (
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
            onGoToArtist: track.album?.artistID 
              ? () => navigate(`/app/artists/${track.album?.artistID}`) 
              : undefined,
            onRemoveFromPlaylist: isOwner ? () => onRemoveFromPlaylist(track) : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, playQueue } = usePlayer();

  // State
  const [data, setData] = useState<PlaylistData>({
    playlist: null,
    tracks: [],
  });
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistDialogOpen, setIsAddToPlaylistDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Check if current user is the owner
  const isOwner = user?.id === data.playlist?.userID;

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoadingState("loading");
    try {
      const { playlist, tracks } = await playlistsApi.getPlaylistWithTracks(id);
      setData({ playlist, tracks });
      setLoadingState("success");
    } catch (error) {
      console.error("Failed to fetch playlist:", error);
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
    setIsAddToPlaylistDialogOpen(true);
  };

  const handleRemoveFromPlaylist = async (track: Track) => {
    if (!id) return;

    try {
      await playlistsApi.removeTrackFromPlaylist(id, track.id);
      // Update local state
      setData((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((t) => t.id !== track.id),
      }));
    } catch (error) {
      console.error("Failed to remove track from playlist:", error);
    }
  };

  const handleRename = async (newName: string) => {
    if (!id) return;
    
    await playlistsApi.updatePlaylist(id, { name: newName });
    setData((prev) => ({
      ...prev,
      playlist: prev.playlist ? { ...prev.playlist, name: newName } : null,
    }));
  };

  const handleDelete = async () => {
    if (!id) return;
    
    await playlistsApi.deletePlaylist(id);
    navigate("/app/library");
  };

  // ============================================
  // RENDER
  // ============================================

  if (loadingState === "loading") {
    return <LoadingSection message="Loading playlist..." />;
  }

  if (loadingState === "error" || !data.playlist) {
    return (
      <ErrorState
        title="Playlist not found"
        message="We couldn't find this playlist. It may have been removed."
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <PlaylistHero
        playlist={data.playlist}
        tracks={data.tracks}
        isOwner={isOwner}
        onPlayAll={handlePlayAll}
        onShuffle={handleShuffle}
        onBack={handleBack}
        onRename={() => setIsRenameDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      {/* Tracks List */}
      <TracksList
        tracks={data.tracks}
        isOwner={isOwner}
        onPlayTrack={handlePlayTrack}
        onAddToPlaylist={handleAddToPlaylist}
        onRemoveFromPlaylist={handleRemoveFromPlaylist}
      />

      {/* Add to Playlist Dialog */}
      <AddToPlaylistDialog
        open={isAddToPlaylistDialogOpen}
        onOpenChange={setIsAddToPlaylistDialogOpen}
        tracks={selectedTrack ? [selectedTrack] : []}
      />

      {/* Rename Dialog */}
      <RenameDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        currentName={data.playlist.name}
        onRename={handleRename}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        playlistName={data.playlist.name}
        onDelete={handleDelete}
      />
    </div>
  );
}
