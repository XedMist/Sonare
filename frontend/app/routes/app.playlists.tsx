import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { meApi, playlistsApi, type Playlist } from "~/lib/api";
import { useAuth } from "~/context/AuthContext";
import { usePlayer } from "~/context/PlayerContext";
import { PlaylistCard } from "~/components/cards";
import { CardGridSkeleton, EmptyState } from "~/components/LoadingStates";
import { Button } from "~/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/Dialog";
import { Input } from "~/components/ui/Input";
import { Label } from "~/components/ui/label";

export default function PlaylistsPage() {
    const { user } = useAuth();
    const player = usePlayer();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (headerRef.current) {
            animate(headerRef.current, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                ease: "outCubic",
            });
        }
    }, []);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
            const data = await meApi.getPlaylists({ page: 0, limit: 50 });
            setPlaylists(data);
        } catch (error) {
            console.error("Error fetching playlists:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim() || !user) return;

        setIsCreating(true);
        try {
            const newPlaylist = await playlistsApi.create(newPlaylistName.trim(), user.id);
            setPlaylists((prev) => [newPlaylist, ...prev]);
            setNewPlaylistName("");
            setDialogOpen(false);
        } catch (error) {
            console.error("Error creating playlist:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handlePlayPlaylist = async (playlist: Playlist) => {
        try {
            const fullPlaylist = await playlistsApi.get(playlist.id);
            if (fullPlaylist.tracks && fullPlaylist.tracks.length > 0) {
                player.playTracks(fullPlaylist.tracks);
            }
        } catch (error) {
            console.error("Error playing playlist:", error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div ref={headerRef} className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-surface-50 mb-2">
                        Tus Playlists
                    </h1>
                    <p className="text-surface-400">
                        {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
                    </p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary-500 text-white hover:bg-primary-400">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Nueva Playlist
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-surface-800 border-surface-700">
                        <DialogHeader>
                            <DialogTitle className="text-surface-50">Crear Playlist</DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCreatePlaylist();
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-surface-200">
                                    Nombre de la playlist
                                </Label>
                                <Input
                                    id="name"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="Mi playlist increíble"
                                    className="bg-surface-700/50 border-surface-600 text-surface-50"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!newPlaylistName.trim() || isCreating}
                                    className="bg-primary-500 text-white hover:bg-primary-400"
                                >
                                    {isCreating ? "Creando..." : "Crear"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Playlists Grid */}
            {isLoading ? (
                <CardGridSkeleton count={6} type="playlist" />
            ) : playlists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {playlists.map((playlist, index) => (
                        <PlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            index={index}
                            onPlay={handlePlayPlaylist}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                    }
                    title="No tienes playlists"
                    description="Crea tu primera playlist para organizar tu música favorita"
                    action={
                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="bg-primary-500 text-white hover:bg-primary-400"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Crear Playlist
                        </Button>
                    }
                />
            )}
        </div>
    );
}
