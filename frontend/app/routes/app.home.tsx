import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import * as artistsApi from "../api/artists";
import * as albumsApi from "../api/albums";
import * as tracksApi from "../api/tracks";
import * as playlistsApi from "../api/playlists";
import { animate, stagger } from "animejs";
import {
  WelcomeHeader,
  QuickPlaySection,
  MediaSection,
  FeaturedCard,
  FeaturedCardSkeleton,
} from "../components/home";
import { Artwork } from "../components/ui/Avatar";
import { PlayIcon } from "../components/icons/Icons";
import { Music, Disc3, Users, Sparkles, TrendingUp, Clock } from "lucide-react";
import type { Artist, Album, Track, Playlist } from "../types";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inicio - Sonare" },
    { name: "description", content: "Descubre música en Sonare" },
  ];
}

// Componente de estadísticas animadas
function StatsBar({ artists, albums, tracks }: { artists: number; albums: number; tracks: number }) {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statsRef.current) return;

    animate(".stat-item", {
      opacity: [0, 1],
      translateY: [10, 0],
      delay: stagger(100, { start: 800 }),
      duration: 500,
      ease: "outQuad",
    });
  }, []);

  const stats = [
    { icon: Users, label: "Artistas", value: artists, color: "text-purple-400" },
    { icon: Disc3, label: "Álbumes", value: albums, color: "text-pink-400" },
    { icon: Music, label: "Canciones", value: tracks, color: "text-blue-400" },
  ];

  return (
    <div ref={statsRef} className="grid grid-cols-3 gap-4 mb-10">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="stat-item bg-surface-800/40 backdrop-blur-sm rounded-xl p-4 border border-surface-700/30 opacity-0"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-surface-700/50 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-50">{stat.value}</p>
              <p className="text-sm text-surface-400">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente de tarjeta destacada grande
function HeroFeaturedCard({
  album,
  onPlay,
  onClick,
}: {
  album: Album;
  onPlay: () => void;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      delay: 400,
      ease: "outExpo",
    });
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900/40 via-surface-800/60 to-surface-800/40 border border-primary-500/20 mb-10 group cursor-pointer opacity-0"
      onClick={onClick}
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
          <h2 className="text-2xl md:text-3xl font-bold text-surface-50 mb-2">
            {album.name}
          </h2>
          <p className="text-surface-400 mb-4">
            {album.artist?.name || "Artista desconocido"} • Álbum
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-surface-900 font-semibold px-6 py-3 rounded-full shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all hover:scale-105"
          >
            <PlayIcon size={20} />
            Reproducir
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de géneros/categorías rápidas
function QuickCategories() {
  const categories = [
    { name: "Tendencias", icon: TrendingUp, gradient: "from-pink-500 to-rose-500" },
    { name: "Recientes", icon: Clock, gradient: "from-blue-500 to-cyan-500" },
    { name: "Descubrir", icon: Sparkles, gradient: "from-purple-500 to-violet-500" },
    { name: "Favoritos", icon: Music, gradient: "from-amber-500 to-orange-500" },
  ];

  useEffect(() => {
    animate(".category-chip", {
      opacity: [0, 1],
      translateX: [-20, 0],
      delay: stagger(80, { start: 600 }),
      duration: 400,
      ease: "outQuad",
    });
  }, []);

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category) => (
        <button
          key={category.name}
          className={`category-chip flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${category.gradient} text-white font-medium text-sm shadow-lg hover:scale-105 transition-transform opacity-0`}
        >
          <category.icon size={16} />
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default function AppHomePage() {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const { user } = useAuth();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [artistsRes, albumsRes, tracksRes, playlistsRes] = await Promise.all([
          artistsApi.getArtists({ limit: 12 }),
          albumsApi.getAlbums({ limit: 12 }),
          tracksApi.getTracks({ limit: 10 }),
          playlistsApi.getPlaylists({ limit: 6 }),
        ]);

        setArtists(artistsRes.data || []);
        setAlbums(albumsRes.data || []);
        setTracks(tracksRes.data || []);
        setPlaylists(playlistsRes.data || []);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudo cargar el contenido. Por favor, inténtalo de nuevo.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handlePlayAlbum = async (album: Album) => {
    try {
      const tracksRes = await albumsApi.getAlbumTracks(album.id, { limit: 50 });
      if (tracksRes.data && tracksRes.data.length > 0) {
        playQueue(tracksRes.data);
      }
    } catch (err) {
      console.error("Error al reproducir álbum:", err);
    }
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    navigate(`/app/playlists/${playlist.id}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music size={32} className="text-red-400" />
          </div>
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-surface-700 hover:bg-surface-600 text-surface-100 rounded-full font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const featuredAlbum = albums[0];

  return (
    <div className="pb-8">
      {/* Header de bienvenida */}
      <WelcomeHeader userName={user?.name} />

      {/* Categorías rápidas */}
      <QuickCategories />

      {/* Álbum destacado */}
      {!isLoading && featuredAlbum && (
        <HeroFeaturedCard
          album={featuredAlbum}
          onPlay={() => handlePlayAlbum(featuredAlbum)}
          onClick={() => navigate(`/app/albums/${featuredAlbum.id}`)}
        />
      )}

      {/* Estadísticas */}
      {!isLoading && (
        <StatsBar
          artists={artists.length}
          albums={albums.length}
          tracks={tracks.length}
        />
      )}

      {/* Sección: Continúa escuchando */}
      <QuickPlaySection
        tracks={tracks}
        isLoading={isLoading}
        onPlay={(track: Track) => playQueue([track])}
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
                image={artist.image}
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
    </div>
  );
}
