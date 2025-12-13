import { useState, useEffect } from "react";
import { meApi, playlistsApi, type Playlist, type Track } from "~/lib/api";
import { useAuth } from "~/context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/Dialog";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { ScrollArea } from "~/components/ui/ScrollArea";
import { cn } from "~/lib/utils";

interface AddToPlaylistDialogProps {
    track: Track | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddToPlaylistDialog({
    track,
    open,
    onOpenChange,
    onSuccess,
}: AddToPlaylistDialogProps) {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
    const [addingToPlaylistId, setAddingToPlaylistId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchPlaylists();
        }
    }, [open]);

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

    const handleAddToPlaylist = async (playlist: Playlist) => {
        if (!track) return;

        setAddingToPlaylistId(playlist.id);
        try {
            await playlistsApi.addTrack(playlist.id, track.id);
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Error adding track to playlist:", error);
        } finally {
            setAddingToPlaylistId(null);
        }
    };

    const handleCreateAndAdd = async () => {
        if (!track || !user || !newPlaylistName.trim()) return;

        setIsCreating(true);
        try {
            const newPlaylist = await playlistsApi.create(newPlaylistName.trim(), user.id);
            await playlistsApi.addTrack(newPlaylist.id, track.id);
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating playlist:", error);
        } finally {
            setIsCreating(false);
            setNewPlaylistName("");
            setShowNewPlaylistInput(false);
        }
    };

    // Generate playlist gradient from name
    const getPlaylistGradient = (name: string) => {
        const gradients = [
            "from-primary-600 to-purple-800",
            "from-blue-600 to-primary-700",
            "from-emerald-600 to-cyan-700",
            "from-pink-600 to-rose-700",
            "from-amber-600 to-orange-700",
            "from-violet-600 to-indigo-700",
        ];
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradients[hash % gradients.length];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-surface-800 border-surface-700 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-surface-50">Añadir a Playlist</DialogTitle>
                </DialogHeader>

                {track && (
                    <div className="flex items-center gap-3 p-3 bg-surface-700/50 rounded-lg mb-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-surface-600 flex-shrink-0">
                            {track.thumbnail ? (
                                <img
                                    src={track.thumbnail}
                                    alt={track.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-surface-400">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-surface-50 font-medium truncate">{track.name}</p>
                            <p className="text-surface-400 text-sm truncate">{track.album?.name}</p>
                        </div>
                    </div>
                )}

                {/* New playlist input */}
                {showNewPlaylistInput ? (
                    <div className="space-y-3 mb-4">
                        <Input
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Nombre de la playlist"
                            className="bg-surface-700/50 border-surface-600 text-surface-50"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setShowNewPlaylistInput(false);
                                    setNewPlaylistName("");
                                }}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleCreateAndAdd}
                                disabled={!newPlaylistName.trim() || isCreating}
                                className="flex-1 bg-primary-500 text-white hover:bg-primary-400"
                            >
                                {isCreating ? "Creando..." : "Crear y añadir"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowNewPlaylistInput(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-700/50 transition-colors mb-2"
                    >
                        <div className="w-12 h-12 rounded-md bg-surface-600 flex items-center justify-center text-surface-300">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        </div>
                        <span className="text-surface-200 font-medium">Nueva playlist</span>
                    </button>
                )}

                {/* Playlists list */}
                <ScrollArea className="max-h-[300px]">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                    <div className="w-12 h-12 rounded-md bg-surface-700" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-surface-700 rounded w-3/4" />
                                        <div className="h-3 bg-surface-700 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : playlists.length > 0 ? (
                        <div className="space-y-1">
                            {playlists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    onClick={() => handleAddToPlaylist(playlist)}
                                    disabled={addingToPlaylistId === playlist.id}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-700/50 transition-colors text-left",
                                        addingToPlaylistId === playlist.id && "opacity-50"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-md bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                            getPlaylistGradient(playlist.name)
                                        )}
                                    >
                                        <svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-surface-50 font-medium truncate">{playlist.name}</p>
                                        <p className="text-surface-400 text-sm">
                                            {playlist.tracks?.length || 0} canciones
                                        </p>
                                    </div>
                                    {addingToPlaylistId === playlist.id && (
                                        <svg className="w-5 h-5 text-primary-400 animate-spin ml-auto" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-surface-400 py-8">
                            No tienes playlists. ¡Crea una nueva!
                        </p>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

export default AddToPlaylistDialog;
