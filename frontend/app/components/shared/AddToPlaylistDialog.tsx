import { useState, useEffect } from "react";
import * as playlistsApi from "../../api/playlists";
import { Dialog, DialogContent, DialogHeader, DialogFooter, Button } from "../ui";
import { PlusIcon, MusicNoteIcon } from "../icons/Icons";
import type { Playlist, Track } from "../../types";

interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracks: Track[];
  onSuccess?: () => void;
}

export function AddToPlaylistDialog({
  open,
  onOpenChange,
  tracks,
  onSuccess,
}: AddToPlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPlaylists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await playlistsApi.getPlaylists({ limit: 50 });
        if (isMounted) {
          setPlaylists(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch playlists:", err);
          setError("Failed to load playlists");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    if (open) {
      fetchPlaylists();
    }
    
    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (tracks.length === 0) return;

    try {
      setIsAdding(playlist.id);
      setError(null);
      const trackIds = tracks.map((t) => t.id);
      await playlistsApi.addTracksToPlaylist(playlist.id, trackIds);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to add tracks to playlist:", err);
      setError("Failed to add tracks to playlist");
    } finally {
      setIsAdding(null);
    }
  };

  const trackLabel =
    tracks.length === 1
      ? `"${tracks[0].name}"`
      : `${tracks.length} tracks`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          Add to playlist
        </DialogHeader>

        <p className="text-sm text-surface-400 mb-4">
          Adding {trackLabel}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="max-h-64 overflow-y-auto space-y-1">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-surface-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : playlists.length > 0 ? (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-700 transition-colors text-left disabled:opacity-50"
                onClick={() => handleAddToPlaylist(playlist)}
                disabled={isAdding !== null}
              >
                <div className="w-10 h-10 bg-surface-600 rounded flex items-center justify-center">
                  {isAdding === playlist.id ? (
                    <svg
                      className="animate-spin h-5 w-5 text-primary-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <MusicNoteIcon size={20} className="text-surface-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-surface-100 block truncate">
                    {playlist.name}
                  </span>
                  <span className="text-xs text-surface-400">
                    {playlist.tracks?.length || 0} tracks
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <PlusIcon size={40} className="mx-auto text-surface-600 mb-2" />
              <p className="text-surface-400">No playlists available</p>
              <p className="text-sm text-surface-500">
                Create a playlist first
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
