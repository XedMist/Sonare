import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { animate } from "animejs";
import { albumsApi, meApi, type Album, type Track } from "~/lib/api";
import { usePlayer } from "~/context/PlayerContext";
import { TrackCard } from "~/components/cards";
import { PageLoader, EmptyState, TrackListSkeleton } from "~/components/LoadingStates";
import { Button } from "~/components/ui/Button";
import { cn } from "~/lib/utils";

// Format total duration
function formatTotalDuration(tracks: Track[]): string {
    const totalSeconds = tracks.reduce((acc, track) => acc + (track.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
}

export default function AlbumPage() {
    const { id } = useParams<{ id: string }>();
    const player = usePlayer();

    const [album, setAlbum] = useState<Album | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAlbum = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const [albumData, tracksData, favoritesData] = await Promise.all([
                    albumsApi.get(id),
                    albumsApi.getTracks(id, { page: 0, limit: 100 }),
                    meApi.getFavorites(),
                ]);
                setAlbum(albumData);
                setTracks(tracksData);
                setFavorites(new Set(favoritesData.map((t) => t.id)));
            } catch (error) {
                console.error("Error fetching album:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlbum();
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

    const handleToggleFavorite = async (track: Track) => {
        try {
            if (favorites.has(track.id)) {
                await meApi.removeFavorite(track.id);
                setFavorites((prev) => {
                    const next = new Set(prev);
                    next.delete(track.id);
                    return next;
                });
            } else {
                await meApi.addFavorite(track.id);
                setFavorites((prev) => new Set(prev).add(track.id));
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    // Generate album gradient from name
    const getAlbumGradient = (name: string) => {
        const gradients = [
            "from-indigo-600/80 via-indigo-800/60 to-surface-900",
            "from-rose-600/80 via-rose-800/60 to-surface-900",
            "from-emerald-600/80 via-emerald-800/60 to-surface-900",
            "from-amber-600/80 via-amber-800/60 to-surface-900",
            "from-cyan-600/80 via-cyan-800/60 to-surface-900",
            "from-violet-600/80 via-violet-800/60 to-surface-900",
        ];
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradients[hash % gradients.length];
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (!album) {
        return (
            <EmptyState
                icon={
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                    </svg>
                }
                title="Álbum no encontrado"
                description="El álbum que buscas no existe o fue eliminado"
                action={
                    <Link to="/app">
                        <Button>Volver al inicio</Button>
                    </Link>
                }
            />
        );
    }

    // Get album cover from first track with a thumbnail
    const albumCover = tracks.find((track) => track.thumbnail)?.thumbnail;

    return (
        <div className="space-y-8 -m-8">
            {/* Album Header */}
            <div
                ref={headerRef}
                className={cn(
                    "relative h-80 bg-gradient-to-b p-8 flex items-end",
                    getAlbumGradient(album.name)
                )}
            >
                <div className="flex items-end gap-8">
                    {/* Album art */}
                    <div className="w-56 h-56 rounded-lg overflow-hidden shadow-2xl shadow-black/50 flex-shrink-0">
                        {albumCover ? (
                            <img
                                src={albumCover}
                                alt={album.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-surface-600 to-surface-700 flex items-center justify-center">
                                <svg className="w-20 h-20 text-surface-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Album info */}
                    <div className="pb-4">
                        <span className="text-sm text-surface-200 font-medium">ÁLBUM</span>
                        <h1 className="text-5xl font-bold text-surface-50 mb-4">
                            {album.name}
                        </h1>
                        <div className="flex items-center gap-2 text-surface-300">
                            {album.artist && (
                                <>
                                    <Link
                                        to={`/app/artists/${album.artist.id}`}
                                        className="hover:text-surface-50 hover:underline font-medium"
                                    >
                                        {album.artist.name}
                                    </Link>
                                    <span>•</span>
                                </>
                            )}
                            {album.releaseYear && (
                                <>
                                    <span>{album.releaseYear}</span>
                                    <span>•</span>
                                </>
                            )}
                            <span>{tracks.length} canciones</span>
                            <span>•</span>
                            <span>{formatTotalDuration(tracks)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions & Tracks */}
            <div ref={contentRef} className="px-8">
                {/* Action buttons */}
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

                {/* Track list */}
                {tracks.length > 0 ? (
                    <div className="space-y-1">
                        {/* Header */}
                        <div className="flex items-center gap-4 px-3 py-2 text-surface-400 text-sm border-b border-surface-700/50 mb-2">
                            <span className="w-8 text-center">#</span>
                            <span className="w-12" /> {/* thumbnail space */}
                            <span className="flex-1">TÍTULO</span>
                            <span className="w-12 text-right">
                                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                            </span>
                        </div>

                        {/* Tracks */}
                        {tracks.map((track, index) => (
                            <TrackCard
                                key={track.id}
                                track={track}
                                index={index}
                                isPlaying={player.isPlaying}
                                isCurrentTrack={player.currentTrack?.id === track.id}
                                onPlay={() => handlePlayTrack(track, index)}
                                onAddToQueue={() => player.addToQueue(track)}
                                onAddToFavorites={() => handleToggleFavorite(track)}
                                showAlbum={false}
                                showArtist={true}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        }
                        title="Sin canciones"
                        description="Este álbum no tiene canciones"
                    />
                )}
            </div>
        </div>
    );
}
