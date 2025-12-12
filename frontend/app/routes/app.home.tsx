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
import { AddToPlaylistDialog } from "../components/shared/AddToPlaylistDialog";
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

// ============================================
// TYPES
// ============================================

interface HomeData {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  playlists: Playlist[];
}

type LoadingState = "loading" | "error" | "success";

// ============================================
// WELCOME SECTION
// ============================================

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

// ============================================
// QUICK PLAY SECTION
// ============================================

interface QuickPlayCardProps {
  title: string;
  subtitle?: string;
  artwork?: string;
  onPlay: () => void;
}

function QuickPlayCard({ title, subtitle, artwork, onPlay }: QuickPlayCardProps) {
  return (
    <div 
      className="group relative flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/60 transition-all cursor-pointer border border-surface-700/30"
      onClick={onPlay}
    >
      {/* Background glow effect */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />

      <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
        {/* Album artwork */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
          <Artwork
            src={album.cover}
            alt={album.name}
            size="full"
            rounded="lg"
            className="relative w-40 h-40 md:w-48 md:h-48 shadow-2xl group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <Sparkles size={16} className="text-primary-400" />
            <span className="text-xs uppercase tracking-wider text-primary-400 font-semibold">
              Destacado para ti
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-100 truncate">{title}</p>
        {subtitle && <p className="text-sm text-surface-400 truncate">{subtitle}</p>}
      </div>
      <button
        className="absolute right-3 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all hover:bg-primary-400"
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

// ============================================
// MEDIA GRID SECTION
// ============================================

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

// ============================================
// RECENT TRACKS SECTION
// ============================================

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

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function AppHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, playQueue } = usePlayer();
  
  // State
  const [data, setData] = useState<HomeData>({
    artists: [],
    albums: [],
    tracks: [],
    playlists: [],
  });
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================

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

  // ============================================
  // HANDLERS
  // ============================================

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

  // ============================================
  // RENDER
  // ============================================

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

  // Prepare data for sections
  const albumItems = data.albums.map((album) => ({
    type: "album" as const,
    id: album.id,
    name: album.name,
    subtitle: album.artist?.name,
    artwork: album.id ? tracksApi.getTrackThumbnailUrl(album.id) : undefined,
  }));

  const artistItems = data.artists.map((artist) => ({
    type: "artist" as const,
    id: artist.id,
    name: artist.name,
  }));

  const playlistItems = data.playlists.map((playlist) => ({
    type: "playlist" as const,
    id: playlist.id,
    name: playlist.name,
    subtitle: `${playlist.tracks?.length || 0} tracks`,
  }));

  // Quick play items (mix of recent albums and playlists)
  const quickPlayItems = [
    ...data.albums.slice(0, 3).map((album) => ({
      id: album.id,
      title: album.name,
      subtitle: album.artist?.name,
      type: "album" as const,
    })),
    ...data.playlists.slice(0, 3).map((playlist) => ({
      id: playlist.id,
      title: playlist.name,
      subtitle: "Playlist",
      type: "playlist" as const,
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
                onPlay={() => item.type === "album" ? handlePlayAlbum(item.id) : handlePlayPlaylist(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Tracks */}
      <RecentTracksSection
        tracks={data.tracks}
        onPlayTrack={handlePlayTrack}
        onAddToPlaylist={handleAddToPlaylist}
      />

      {/* Albums Grid */}
      <MediaGridSection
        title="Albums"
        subtitle="Browse your collection"
        items={albumItems}
        onPlayItem={handlePlayAlbum}
        onSeeAll={() => navigate("/app/library")}
      />

      {/* Sección: Álbumes populares */}
      <MediaSection
        title="Álbumes populares"
        subtitle="Los más escuchados esta semana"
        viewAllLink="/app/albums"
        delay={0}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <FeaturedCardSkeleton key={i} />
            ))
          : albums.slice(1, 7).map((album) => (
              <FeaturedCard
                key={album.id}
                title={album.name}
                subtitle={album.artist?.name || "Artista desconocido"}
                image={album.cover}
                onClick={() => navigate(`/app/albums/${album.id}`)}
                onPlay={() => handlePlayAlbum(album)}
              />
            ))}
      </MediaSection>

      {/* Sección: Artistas destacados */}
      <MediaSection
        title="Artistas destacados"
        subtitle="Descubre nuevos talentos"
        viewAllLink="/app/artists"
        delay={100}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <FeaturedCardSkeleton key={i} />
            ))
          : artists.slice(0, 6).map((artist) => (
              <FeaturedCard
                key={artist.id}
                title={artist.name}
                subtitle="Artista"
                onClick={() => navigate(`/app/artists/${artist.id}`)}
                rounded="full"
              />
            ))}
      </MediaSection>

      {/* Sección: Tus playlists */}
      {(isLoading || playlists.length > 0) && (
        <MediaSection
          title="Tus playlists"
          subtitle="Tu música organizada"
          viewAllLink="/app/library"
          delay={200}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <FeaturedCardSkeleton key={i} />
              ))
            : playlists.map((playlist) => (
                <FeaturedCard
                  key={playlist.id}
                  title={playlist.name}
                  subtitle="Playlist"
                  onClick={() => navigate(`/app/playlists/${playlist.id}`)}
                  onPlay={() => handlePlayPlaylist(playlist)}
                />
              ))}
        </MediaSection>
      )}

      {/* Sección: Más álbumes para descubrir */}
      {!isLoading && albums.length > 7 && (
        <MediaSection
          title="Explora más"
          subtitle="Música que te puede gustar"
          delay={300}
        >
          {albums.slice(7, 13).map((album) => (
            <FeaturedCard
              key={album.id}
              title={album.name}
              subtitle={album.artist?.name || "Artista desconocido"}
              image={album.cover}
              onClick={() => navigate(`/app/albums/${album.id}`)}
              onPlay={() => handlePlayAlbum(album)}
            />
          ))}
        </MediaSection>
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
