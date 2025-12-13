import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { animate } from "animejs";
import { playlistsApi, type Playlist, type Track } from "~/lib/api";
import { usePlayer } from "~/context/PlayerContext";
import { TrackCard } from "~/components/cards";
import { PageLoader, EmptyState } from "~/components/LoadingStates";
import { Button } from "~/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "~/components/ui/Dialog";
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

export default function PlaylistPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const player = usePlayer();

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPlaylist = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const data = await playlistsApi.get(id);
                setPlaylist(data);
            } catch (error) {
                console.error("Error fetching playlist:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylist();
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
        if (playlist?.tracks) {
            player.playTracks(playlist.tracks, index);
        }
    };

    const handlePlayAll = () => {
        if (playlist?.tracks && playlist.tracks.length > 0) {
            player.playTracks(playlist.tracks);
        }
    };

    const handleShufflePlay = () => {
        if (playlist?.tracks && playlist.tracks.length > 0) {
            const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
            player.playTracks(shuffled);
        }
    };

    const handleRemoveTrack = async (track: Track) => {
        if (!playlist) return;

        try {
            const updatedPlaylist = await playlistsApi.removeTrack(playlist.id, track.id);
            setPlaylist(updatedPlaylist);
        } catch (error) {
            console.error("Error removing track:", error);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!playlist) return;

        setIsDeleting(true);
        try {
            await playlistsApi.delete(playlist.id);
            navigate("/app/playlists");
        } catch (error) {
            console.error("Error deleting playlist:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Generate playlist gradient from name
    const getPlaylistGradient = (name: string) => {
        const gradients = [
            "from-primary-600/80 via-primary-800/60 to-surface-900",
            "from-blue-600/80 via-blue-800/60 to-surface-900",
            "from-emerald-600/80 via-emerald-800/60 to-surface-900",
            "from-pink-600/80 via-pink-800/60 to-surface-900",
            "from-amber-600/80 via-amber-800/60 to-surface-900",
            "from-violet-600/80 via-violet-800/60 to-surface-900",
        ];
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradients[hash % gradients.length];
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (!playlist) {
        return (
            <EmptyState
                icon={
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                    </svg>
                }
                title="Playlist no encontrada"
                description="La playlist que buscas no existe o fue eliminada"
                action={
                    <Link to="/app/playlists">
                        <Button>Volver a playlists</Button>
                    </Link>
                }
            />
        );
    }

    const tracks = playlist.tracks || [];

    return (
        <div className="space-y-8 -m-8">
            {/* Playlist Header */}
            <div
                ref={headerRef}
                className={cn(
                    "relative h-80 bg-gradient-to-b p-8 flex items-end",
                    getPlaylistGradient(playlist.name)
                )}
            >
                <div className="flex items-end gap-8">
                    {/* Playlist cover */}
                    <div className="w-56 h-56 rounded-lg overflow-hidden shadow-2xl shadow-black/50 flex-shrink-0 bg-gradient-to-br from-surface-600 to-surface-700 flex items-center justify-center">
                        <svg className="w-24 h-24 text-surface-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                    </div>

                    {/* Playlist info */}
                    <div className="pb-4">
                        <span className="text-sm text-surface-200 font-medium">PLAYLIST</span>
                        <h1 className="text-5xl font-bold text-surface-50 mb-4">
                            {playlist.name}
                        </h1>
                        <div className="flex items-center gap-2 text-surface-300">
                            <span>{tracks.length} canciones</span>
                            {tracks.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span>{formatTotalDuration(tracks)}</span>
                                </>
                            )}
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
                    <Button
                        size="lg"
                        variant="ghost"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                    </Button>
                </div>

                {/* Track list */}
                {tracks.length > 0 ? (
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
                        {tracks.map((track, index) => (
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
                                    onClick={() => handleRemoveTrack(track)}
                                    className="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-surface-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Remove from playlist"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        }
                        title="Playlist vacía"
                        description="Añade canciones a esta playlist para empezar a escuchar"
                        action={
                            <Link to="/app/search">
                                <Button className="bg-primary-500 text-white hover:bg-primary-400">
                                    Buscar música
                                </Button>
                            </Link>
                        }
                    />
                )}
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-surface-800 border-surface-700">
                    <DialogHeader>
                        <DialogTitle className="text-surface-50">Eliminar Playlist</DialogTitle>
                        <DialogDescription className="text-surface-400">
                            ¿Estás seguro de que quieres eliminar "{playlist.name}"? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeletePlaylist}
                            disabled={isDeleting}
                            className="bg-red-500 text-white hover:bg-red-400"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
