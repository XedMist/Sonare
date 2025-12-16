import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import * as playlistsApi from "../api/playlists";
import * as albumsApi from "../api/albums";
import * as artistsApi from "../api/artists";
import { MediaCard } from "../components/shared/MediaCard";
import { 
  LoadingSection, 
  ErrorState, 
  SectionHeader,
  NoPlaylistsState,
  SkeletonGrid
} from "../components/shared/StateComponents";
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui";
import { Dialog, DialogContent, DialogHeader, DialogFooter, Input } from "../components/ui";
import { PlusIcon, PlaylistIcon, AlbumIcon, ArtistIcon } from "../components/icons/Icons";
import type { Playlist, Album, Artist } from "../types";

interface LibraryData {
  playlists: Playlist[];
  albums: Album[];
  artists: Artist[];
}

type LoadingState = "loading" | "error" | "success";
type TabValue = "playlists" | "albums" | "artists";

interface CreatePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (playlist: Playlist) => void;
  userId: string;
}

function CreatePlaylistDialog({ open, onOpenChange, onCreated, userId }: CreatePlaylistDialogProps) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      setIsCreating(true);
      setError(null);
      const playlist = await playlistsApi.createPlaylist({ 
        name: name.trim(), 
        userID: userId 
      });
      setName("");
      onOpenChange(false);
      onCreated(playlist);
    } catch (err) {
      console.error("Failed to create playlist:", err);
      setError("Failed to create playlist. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={handleClose}>
          Create new playlist
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            isLoading={isCreating} 
            disabled={!name.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LibraryHeaderProps {
  onCreatePlaylist: () => void;
}

function LibraryHeader({ onCreatePlaylist }: LibraryHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-surface-100">Your Library</h1>
        <p className="text-surface-400 mt-1">
          Your playlists, albums, and favorite artists
        </p>
      </div>
      <Button onClick={onCreatePlaylist} className="gap-2">
        <PlusIcon size={18} />
        <span className="hidden sm:inline">New Playlist</span>
      </Button>
    </div>
  );
}

interface PlaylistsTabProps {
  playlists: Playlist[];
  onPlayPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
  isLoading: boolean;
}

function PlaylistsTab({ playlists, onPlayPlaylist, onCreatePlaylist, isLoading }: PlaylistsTabProps) {
  if (isLoading) {
    return <SkeletonGrid count={6} />;
  }

  if (playlists.length === 0) {
    return <NoPlaylistsState onCreatePlaylist={onCreatePlaylist} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {playlists.map((playlist) => (
        <MediaCard
          key={playlist.id}
          type="playlist"
          id={playlist.id}
          name={playlist.name}
          subtitle={`${playlist.trackCount || 0} tracks`}
          artwork={playlist.cover || undefined}
          onPlay={() => onPlayPlaylist(playlist.id)}
        />
      ))}
    </div>
  );
}

interface AlbumsTabProps {
  albums: Album[];
  onPlayAlbum: (albumId: string) => void;
  isLoading: boolean;
}

function AlbumsTab({ albums, onPlayAlbum, isLoading }: AlbumsTabProps) {
  if (isLoading) {
    return <SkeletonGrid count={6} />;
  }

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mb-4">
          <AlbumIcon size={40} className="text-surface-500" />
        </div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">No albums yet</h3>
        <p className="text-surface-400 text-sm max-w-md">
          Albums from your library will appear here.
        </p>
      </div>
    );
  }

  return (
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
  );
}

interface ArtistsTabProps {
  artists: Artist[];
  isLoading: boolean;
}

function ArtistsTab({ artists, isLoading }: ArtistsTabProps) {
  if (isLoading) {
    return <SkeletonGrid count={6} />;
  }

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mb-4">
          <ArtistIcon size={40} className="text-surface-500" />
        </div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">No artists yet</h3>
        <p className="text-surface-400 text-sm max-w-md">
          Your favorite artists will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {artists.map((artist) => (
        <MediaCard
          key={artist.id}
          type="artist"
          id={artist.id}
          name={artist.name}
          artwork={artist.image || undefined}
        />
      ))}
    </div>
  );
}

export default function AppLibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playQueue } = usePlayer();

  const [data, setData] = useState<LibraryData>({
    playlists: [],
    albums: [],
    artists: [],
  });
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [activeTab, setActiveTab] = useState<TabValue>("playlists");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoadingState("loading");
    try {
      const [playlistsRes, albumsRes, artistsRes] = await Promise.all([
        playlistsApi.getPlaylists({ limit: 50 }),
        albumsApi.getAlbums({ limit: 50 }),
        artistsApi.getArtists({ limit: 50 }),
      ]);

      setData({
        playlists: playlistsRes.data || [],
        albums: albumsRes.data || [],
        artists: artistsRes.data || [],
      });
      setLoadingState("success");
    } catch (error) {
      console.error("Failed to fetch library:", error);
      setLoadingState("error");
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleUpdate = () => fetchData();
    window.addEventListener("playlist-update", handleUpdate);
    
    return () => {
      window.removeEventListener("playlist-update", handleUpdate);
    };
  }, [fetchData]);

  const handlePlayPlaylist = async (playlistId: string) => {
    try {
      const tracks = await playlistsApi.getPlaylistTracks(playlistId);
      if (tracks && tracks.length > 0) {
        playQueue(tracks, 0);
      }
    } catch (error) {
      console.error("Failed to play playlist:", error);
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

  const handlePlaylistCreated = (playlist: Playlist) => {
    setData((prev) => ({
      ...prev,
      playlists: [playlist, ...prev.playlists],
    }));
    window.dispatchEvent(new Event('playlist-update'));
    navigate(`/app/playlists/${playlist.id}`);
  };

  if (loadingState === "loading") {
    return <LoadingSection message="Loading your library..." />;
  }

  if (loadingState === "error") {
    return (
      <ErrorState
        title="Failed to load library"
        message="We couldn't load your library. Please try again."
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <LibraryHeader onCreatePlaylist={() => setIsCreateDialogOpen(true)} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="mb-6">
          <TabsTrigger value="playlists" className="gap-2">
            <PlaylistIcon size={18} />
            Playlists
            {data.playlists.length > 0 && (
              <span className="ml-1 text-xs bg-surface-700 px-2 py-0.5 rounded-full">
                {data.playlists.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="albums" className="gap-2">
            <AlbumIcon size={18} />
            Albums
            {data.albums.length > 0 && (
              <span className="ml-1 text-xs bg-surface-700 px-2 py-0.5 rounded-full">
                {data.albums.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="artists" className="gap-2">
            <ArtistIcon size={18} />
            Artists
            {data.artists.length > 0 && (
              <span className="ml-1 text-xs bg-surface-700 px-2 py-0.5 rounded-full">
                {data.artists.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playlists">
          <PlaylistsTab
            playlists={data.playlists}
            onPlayPlaylist={handlePlayPlaylist}
            onCreatePlaylist={() => setIsCreateDialogOpen(true)}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="albums">
          <AlbumsTab
            albums={data.albums}
            onPlayAlbum={handlePlayAlbum}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="artists">
          <ArtistsTab
            artists={data.artists}
            isLoading={false}
          />
        </TabsContent>
      </Tabs>

      {/* Create Playlist Dialog */}
      {user && (
        <CreatePlaylistDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreated={handlePlaylistCreated}
          userId={user.id}
        />
      )}
    </div>
  );
}
