import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { meApi, type Track } from "~/lib/api";
import { usePlayer } from "~/context/PlayerContext";
import { TrackCard } from "~/components/cards";
import { TrackListSkeleton, EmptyState } from "~/components/LoadingStates";
import { Button } from "~/components/ui/Button";
import { Link } from "react-router";
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

export default function FavoritesPage() {
    const player = usePlayer();

    const [favorites, setFavorites] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (headerRef.current) {
            animate(headerRef.current, {
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600,
                ease: "outCubic",
            });
        }
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true);
            try {
                const data = await meApi.getFavorites();
                setFavorites(data);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    useEffect(() => {
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
        player.playTracks(favorites, index);
    };

    const handlePlayAll = () => {
        if (favorites.length > 0) {
            player.playTracks(favorites);
        }
    };

    const handleShufflePlay = () => {
        if (favorites.length > 0) {
            const shuffled = [...favorites].sort(() => Math.random() - 0.5);
            player.playTracks(shuffled);
        }
    };

    const handleRemoveFavorite = async (track: Track) => {
        try {
            await meApi.removeFavorite(track.id);
            setFavorites((prev) => prev.filter((t) => t.id !== track.id));
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    return (
        <div className="space-y-8 -m-8">
            {/* Favorites Header */}
            <div
                ref={headerRef}
                className="relative h-80 bg-gradient-to-b from-primary-600/80 via-primary-800/60 to-surface-900 p-8 flex items-end"
            >
                <div className="flex items-end gap-8">
                    {/* Heart icon */}
                    <div className="w-56 h-56 rounded-lg overflow-hidden shadow-2xl shadow-black/50 flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </div>

                    {/* Info */}
                    <div className="pb-4">
                        <span className="text-sm text-surface-200 font-medium">PLAYLIST</span>
                        <h1 className="text-5xl font-bold text-surface-50 mb-4">
                            Tus Favoritos
                        </h1>
                        <div className="flex items-center gap-2 text-surface-300">
                            <span>{favorites.length} canciones</span>
                            {favorites.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span>{formatTotalDuration(favorites)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions & Tracks */}
            <div ref={contentRef} className="px-8">
                {/* Action buttons */}
                {favorites.length > 0 && (
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            size="lg"
                            onClick={handlePlayAll}
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
                            className="rounded-full"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                            </svg>
                            Aleatorio
                        </Button>
                    </div>
                )}

                {/* Track list */}
                {isLoading ? (
                    <TrackListSkeleton count={10} />
                ) : favorites.length > 0 ? (
                    <div className="space-y-1">
                        {/* Header */}
                        <div className="flex items-center gap-4 px-3 py-2 text-surface-400 text-sm border-b border-surface-700/50 mb-2">
                            <span className="w-8 text-center">#</span>
                            <span className="w-12" />
                            <span className="flex-1">TÍTULO</span>
                            <span className="w-12 text-right">
                                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                            </span>
                        </div>

                        {/* Tracks */}
                        {favorites.map((track, index) => (
                            <div key={track.id} className="group relative">
                                <TrackCard
                                    track={track}
                                    index={index}
                                    isPlaying={player.isPlaying}
                                    isCurrentTrack={player.currentTrack?.id === track.id}
                                    onPlay={() => handlePlayTrack(track, index)}
                                    onAddToQueue={() => player.addToQueue(track)}
                                />
                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemoveFavorite(track)}
                                    className="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-primary-400 hover:text-primary-300 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Remove from favorites"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        }
                        title="No tienes favoritos"
                        description="Las canciones que marques como favoritas aparecerán aquí"
                        action={
                            <Link to="/app/search">
                                <Button className="bg-primary-500 text-white hover:bg-primary-400">
                                    Explorar música
                                </Button>
                            </Link>
                        }
                    />
                )}
            </div>
        </div>
    );
}
