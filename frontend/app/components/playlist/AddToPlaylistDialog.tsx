import { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    Button,
    Input
} from "../ui";
import { getPlaylists, createPlaylist, addTrackToPlaylist } from "../../api/playlists";
import { useAuth } from "../../context/AuthContext";
import type { Playlist } from "../../types";

interface AddToPlaylistDialogProps {
    trackId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddToPlaylistDialog({ trackId, open, onOpenChange }: AddToPlaylistDialogProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (open) {
            fetchPlaylists();
        }
    }, [open]);

    async function fetchPlaylists() {
        try {
            setLoading(true);
            const response = await getPlaylists({ limit: 50 }); 
            setPlaylists(response.data);
        } catch (err) {
            console.error("Failed to load playlists", err);
            setError("Failed to load playlists");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddToPlaylist(playlistId: string) {
        if (!trackId) return;
        try {
            setLoading(true);
            await addTrackToPlaylist(playlistId, trackId);
            window.dispatchEvent(new Event('playlist-update'));
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to add track", err);
            setError("Failed to add track to playlist");
            setLoading(false);
        }
    }

    async function handleCreatePlaylist() {
        if (!newPlaylistName.trim() || !user) return;
        try {
            setLoading(true);
            const playlist = await createPlaylist({ name: newPlaylistName, userID: user.id });
            window.dispatchEvent(new Event('playlist-update'));
            await handleAddToPlaylist(playlist.id);
        } catch (err) {
            console.error("Failed to create playlist", err);
            setError("Failed to create playlist");
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[85vh]">
                <DialogHeader>
                    Add to Playlist
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
                    {error && (
                        <div className="p-3 text-sm text-red-200 bg-red-900/20 border border-red-900/50 rounded-md">
                            {error}
                        </div>
                    )}

                    {!creating ? (
                        <>
                            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                                {loading && playlists.length === 0 ? (
                                    <div className="flex justify-center p-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                                    </div>
                                ) : playlists.length === 0 ? (
                                    <p className="text-center text-surface-400 py-4">No playlists found</p>
                                ) : (
                                    playlists.map((playlist) => (
                                        <button
                                            key={playlist.id}
                                            onClick={() => handleAddToPlaylist(playlist.id)}
                                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-surface-700 transition-colors flex items-center gap-3 group"
                                        >
                                            <div className="w-10 h-10 bg-surface-800 rounded flex items-center justify-center text-surface-400 group-hover:text-surface-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-surface-100 truncate">{playlist.name}</p>
                                                <p className="text-sm text-surface-400">
                                                    {playlist.trackCount || 0} tracks
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full mt-2"
                                onClick={() => setCreating(true)}
                            >
                                + Create New Playlist
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-surface-300">Playlist Name</label>
                                <Input
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="My Awesome Playlist"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setCreating(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleCreatePlaylist}
                                    disabled={!newPlaylistName.trim() || loading}
                                >
                                    {loading ? "Creating..." : "Create & Add"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
