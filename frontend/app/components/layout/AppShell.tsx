import { useState } from "react";
import { Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";
import * as playlistsApi from "../../api/playlists";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PlayerBar } from "../player/PlayerBar";
import { Dialog, DialogContent, DialogHeader, DialogFooter, Button, Input } from "../ui";

export function AppShell() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim() || !user?.id) return;
    
    try {
      setIsCreating(true);
      await playlistsApi.createPlaylist({ name: playlistName.trim(), userID: user.id });
      setPlaylistName("");
      setIsCreatePlaylistOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to create playlist:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-24">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <PlayerBar />

      <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setIsCreatePlaylistOpen(false)}>
            Create new playlist
          </DialogHeader>
          <Input
            placeholder="Playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreatePlaylistOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaylist} isLoading={isCreating} disabled={!playlistName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
