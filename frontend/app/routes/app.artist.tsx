import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { animate } from "animejs";
import { artistsApi, type Artist, type Album, type Track } from "~/lib/api";
import { usePlayer } from "~/context/PlayerContext";
import { AlbumCard, TrackCard } from "~/components/cards";
import { PageLoader, EmptyState, CardGridSkeleton, TrackListSkeleton } from "~/components/LoadingStates";
import { Button } from "~/components/ui/Button";
import { cn } from "~/lib/utils";

export default function ArtistPage() {
    const { id } = useParams<{ id: string }>();
    const player = usePlayer();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllTracks, setShowAllTracks] = useState(false);

    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchArtist = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const [artistData, albumsData, tracksData] = await Promise.all([
                    artistsApi.get(id),
                    artistsApi.getAlbums(id, { page: 0, limit: 20 }),
                    artistsApi.getTracks(id, { page: 0, limit: 50 }),
                ]);
                setArtist(artistData);
                setAlbums(albumsData);
                setTracks(tracksData);
            } catch (error) {
                console.error("Error fetching artist:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtist();
    }, [id]);

    useEffect(() => {
        if (!isLoading && headerRef.current) {
            animate(headerRef.current, {
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600,
                ease: "outCubic",
            });
        }
        if (!isLoading && contentRef.current) {
            animate(contentRef.current, {
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 600,
                ease: "outCubic",
                delay: 200,
            });
        }
    }, [isLoading]);

    const handlePlayTrack = (track: Track, index: number) => {
        player.playTracks(tracks, index);
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            player.playTracks(tracks);
        }
    };

    const handleShufflePlay = () => {
        if (tracks.length > 0) {
            const shuffled = [...tracks].sort(() => Math.random() - 0.5);
            player.playTracks(shuffled);
        }
    };

    const handlePlayAlbum = async (album: Album) => {
        try {
            const albumTracks = tracks.filter((t) => t.albumID === album.id);
            if (albumTracks.length > 0) {
                player.playTracks(albumTracks);
            }
        } catch (error) {
            console.error("Error playing album:", error);
        }
    };

    // Generate artist color from name
    const getArtistGradient = (name: string) => {
        const gradients = [
            "from-purple-600/80 via-purple-800/60 to-surface-900",
            "from-blue-600/80 via-blue-800/60 to-surface-900",
            "from-pink-600/80 via-pink-800/60 to-surface-900",
            "from-green-600/80 via-green-800/60 to-surface-900",
            "from-orange-600/80 via-orange-800/60 to-surface-900",
            "from-teal-600/80 via-teal-800/60 to-surface-900",
        ];
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradients[hash % gradients.length];
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (!artist) {
        return (
            <EmptyState
                icon={
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                }
                title="Artista no encontrado"
                description="El artista que buscas no existe o fue eliminado"
                action={
                    <Link to="/app">
                        <Button>Volver al inicio</Button>
                    </Link>
                }
            />
        );
    }

    const displayedTracks = showAllTracks ? tracks : tracks.slice(0, 5);

    // Build album thumbnail map from tracks
    const albumThumbnails = new Map<string, string>();
    for (const track of tracks) {
        if (track.albumID && track.thumbnail && !albumThumbnails.has(track.albumID)) {
            albumThumbnails.set(track.albumID, track.thumbnail);
        }
    }

    return (
        <div className="space-y-8 -m-8">
            {/* Artist Header */}
            <div
                ref={headerRef}
                className={cn(
                    "relative h-80 bg-gradient-to-b p-8 flex items-end",
                    getArtistGradient(artist.name)
                )}
            >
                <div className="flex items-end gap-8">
                    {/* Artist avatar */}
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-black/50">
                        <span className="text-7xl font-bold text-white">
                            {artist.name.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* Artist info */}
                    <div className="pb-4">
                        <span className="text-sm text-surface-200 font-medium">ARTISTA</span>
                        <h1 className="text-6xl font-bold text-surface-50 mb-4">
                            {artist.name}
                        </h1>
                        <p className="text-surface-300">
                            {tracks.length} canciones • {albums.length} álbumes
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div ref={contentRef} className="px-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        size="lg"
                        onClick={handlePlayAll}
                        disabled={tracks.length === 0}
                        className="bg-primary-500 text-white hover:bg-primary-400 shadow-lg shadow-primary-500/25 rounded-full px-8"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Reproducir
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleShufflePlay}
                        disabled={tracks.length === 0}
                        className="rounded-full"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                        </svg>
                        Aleatorio
                    </Button>
                </div>

                {/* Popular Tracks */}
                {tracks.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-surface-50 mb-6">
                            Canciones Populares
                        </h2>
                        <div className="space-y-1">
                            {displayedTracks.map((track, index) => (
                                <TrackCard
                                    key={track.id}
                                    track={track}
                                    index={index}
                                    isPlaying={player.isPlaying}
                                    isCurrentTrack={player.currentTrack?.id === track.id}
                                    onPlay={() => handlePlayTrack(track, index)}
                                    onAddToQueue={() => player.addToQueue(track)}
                                    showAlbum={true}
                                    showArtist={false}
                                />
                            ))}
                        </div>
                        {tracks.length > 5 && (
                            <button
                                onClick={() => setShowAllTracks(!showAllTracks)}
                                className="mt-4 text-sm text-surface-400 hover:text-surface-200 font-medium transition-colors"
                            >
                                {showAllTracks ? "Ver menos" : `Ver las ${tracks.length} canciones`}
                            </button>
                        )}
                    </section>
                )}

                {/* Albums */}
                {albums.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-surface-50 mb-6">
                            Álbumes
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {albums.map((album, index) => (
                                <AlbumCard
                                    key={album.id}
                                    album={album}
                                    index={index}
                                    onPlay={handlePlayAlbum}
                                    thumbnail={albumThumbnails.get(album.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
