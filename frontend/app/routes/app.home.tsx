import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import * as artistsApi from "../api/artists";
import * as albumsApi from "../api/albums";
import * as tracksApi from "../api/tracks";
import * as playlistsApi from "../api/playlists";
import { MediaCard } from "../components/shared/MediaCard";
import { TrackRow, TrackListHeader } from "../components/shared/TrackRow";
import { AddToPlaylistDialog } from "../components/playlist/AddToPlaylistDialog";
import { 
  LoadingSection, 
  ErrorState, 
  SectionHeader,
  SkeletonGrid,
  SkeletonTrackList
} from "../components/shared/StateComponents";
import { Button } from "../components/ui";
import { PlayIcon } from "../components/icons/Icons";
import type { Artist, Album, Track, Playlist } from "../types";

interface HomeData {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  playlists: Playlist[];
}

type LoadingState = "loading" | "error" | "success";

interface WelcomeSectionProps {
  userName: string;
}

function WelcomeSection({ userName }: WelcomeSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-surface-100 mb-2">
        {getGreeting()}, <span className="text-primary-400">{userName}</span>
      </h1>
      <p className="text-surface-400">
        What would you like to listen to today?
      </p>
    </div>
  );
}

interface QuickPlayCardProps {
  title: string;
  subtitle?: string;
  artwork?: string;
  onPlay: () => void;
  onClick: () => void;
}

function QuickPlayCard({ title, subtitle, artwork, onPlay, onClick }: QuickPlayCardProps) {
  return (
    <div 
      className="group relative flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/60 transition-all cursor-pointer border border-surface-700/30"
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded bg-surface-700 overflow-hidden flex-shrink-0">
        {artwork ? (
          <img src={artwork} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <PlayIcon size={20} className="text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-100 truncate">{title}</p>
        {subtitle && <p className="text-sm text-surface-400 truncate">{subtitle}</p>}
      </div>
      <button
        className="absolute right-3 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all hover:bg-primary-400 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        aria-label={`Play ${title}`}
      >
        <PlayIcon size={18} className="text-surface-900" />
      </button>
    </div>
  );
}

interface MediaGridSectionProps {
  title: string;
  subtitle?: string;
  items: Array<{ type: "album" | "artist" | "playlist"; id: string; name: string; artwork?: string; subtitle?: string }>;
  onSeeAll?: () => void;
  onPlayItem?: (id: string) => void;
  isLoading?: boolean;
}

function MediaGridSection({ title, subtitle, items, onSeeAll, onPlayItem, isLoading }: MediaGridSectionProps) {
  if (isLoading) {
    return (
      <section className="mb-8">
        <SectionHeader title={title} subtitle={subtitle} />
        <SkeletonGrid count={6} />
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader 
        title={title} 
        subtitle={subtitle} 
        action={onSeeAll ? { label: "See all", onClick: onSeeAll } : undefined}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.slice(0, 6).map((item) => (
          <MediaCard
            key={item.id}
            type={item.type}
            id={item.id}
            name={item.name}
            subtitle={item.subtitle}
            artwork={item.artwork}
            onPlay={onPlayItem ? () => onPlayItem(item.id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

interface RecentTracksSectionProps {
  tracks: Track[];
  onPlayTrack: (track: Track, index: number) => void;
  onAddToPlaylist: (track: Track) => void;
  isLoading?: boolean;
}

function RecentTracksSection({ tracks, onPlayTrack, onAddToPlaylist, isLoading }: RecentTracksSectionProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="mb-8">
        <SectionHeader title="Recent Tracks" />
        <SkeletonTrackList count={5} />
      </section>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader title="Recent Tracks" subtitle="Jump back into your music" />
      <div className="bg-surface-800/30 rounded-lg border border-surface-700/30 p-2">
        <TrackListHeader />
        {tracks.slice(0, 5).map((track, index) => (
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

export default function AppHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, playQueue } = usePlayer();
  
  const [data, setData] = useState<HomeData>({
    artists: [],
    albums: [],
    tracks: [],
    playlists: [],
  });
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoadingState("loading");
    try {
      const [artistsRes, albumsRes, tracksRes, playlistsRes] = await Promise.all([
        artistsApi.getArtists({ limit: 12 }),
        albumsApi.getAlbums({ limit: 12 }),
        tracksApi.getTracks({ limit: 20 }),
        playlistsApi.getPlaylists({ limit: 10 }),
      ]);

      setData({
        artists: artistsRes.data || [],
        albums: albumsRes.data || [],
        tracks: tracksRes.data || [],
        playlists: playlistsRes.data || [],
      });
      setLoadingState("success");
    } catch (error) {
      console.error("Failed to fetch home data:", error);
      setLoadingState("error");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handlePlayTrack = (track: Track, index: number) => {
    playTrack(track, data.tracks);
  };

  const handleAddToPlaylist = (track: Track) => {
    setSelectedTrack(track);
    setIsPlaylistDialogOpen(true);
  };

  if (loadingState === "loading") {
    return <LoadingSection message="Loading your music..." />;
  }

  if (loadingState === "error") {
    return (
      <ErrorState
        title="Failed to load"
        message="We couldn't load your home page. Please try again."
        onRetry={fetchData}
      />
    );
  }

  const albumItems = (Array.isArray(data.albums) ? data.albums : []).map((album) => ({
    type: "album" as const,
    id: album.id,
    name: album.name,
    subtitle: album.artist?.name,
    artwork: album.cover,
  }));

  const artistItems = (Array.isArray(data.artists) ? data.artists : []).map((artist) => ({
    type: "artist" as const,
    id: artist.id,
    name: artist.name,
    artwork: artist.image || undefined,
  }));

  const playlistItems = (Array.isArray(data.playlists) ? data.playlists : []).map((playlist) => ({
    type: "playlist" as const,
    id: playlist.id,
    name: playlist.name,
    subtitle: `${playlist.tracks?.length || 0} tracks`,
    artwork: playlist.cover || playlist.tracks?.[0]?.thumbnail,
  }));

  const quickPlayItems = [
    ...(Array.isArray(data.albums) ? data.albums : []).slice(0, 3).map((album) => ({
      id: album.id,
      title: album.name,
      subtitle: album.artist?.name,
      type: "album" as const,
      artwork: album.cover,
    })),
    ...(Array.isArray(data.playlists) ? data.playlists : []).slice(0, 3).map((playlist) => ({
      id: playlist.id,
      title: playlist.name,
      subtitle: "Playlist",
      type: "playlist" as const,
      artwork: playlist.tracks?.[0]?.thumbnail,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <WelcomeSection userName={user?.name || "User"} />

      {/* Quick Play Section */}
      {quickPlayItems.length > 0 && (
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickPlayItems.slice(0, 6).map((item) => (
              <QuickPlayCard
                key={`${item.type}-${item.id}`}
                title={item.title}
                subtitle={item.subtitle}
                artwork={item.artwork}
                onPlay={() => item.type === "album" ? handlePlayAlbum(item.id) : handlePlayPlaylist(item.id)}
                onClick={() => navigate(item.type === "album" ? `/app/albums/${item.id}` : `/app/playlists/${item.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Tracks */}
      <RecentTracksSection
        tracks={Array.isArray(data.tracks) ? data.tracks : []}
        onPlayTrack={handlePlayTrack}
        onAddToPlaylist={handleAddToPlaylist}
      />

      {/* Albums Grid */}
      <MediaGridSection
        title="Albums"
        subtitle="Browse your collection"
        items={albumItems}
        onSeeAll={() => navigate("/app/library")}
      />

      {/* Artists Grid */}
      <MediaGridSection
        title="Artists"
        subtitle="Your favorite artists"
        items={artistItems}
        onSeeAll={() => navigate("/app/library")}
      />

      {/* Playlists Grid */}
      {playlistItems.length > 0 && (
        <MediaGridSection
          title="Your Playlists"
          subtitle="Custom playlists you've created"
          items={playlistItems}
          onPlayItem={handlePlayPlaylist}
          onSeeAll={() => navigate("/app/library")}
        />
      )}

      {/* Add to Playlist Dialog */}
      <AddToPlaylistDialog
        open={isPlaylistDialogOpen}
        onOpenChange={setIsPlaylistDialogOpen}
        trackId={selectedTrack?.id || null}
      />
    </div>
  );
}
