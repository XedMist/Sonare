import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import * as playlistsApi from "../api/playlists";
import { Card, SkeletonCard, Button } from "../components/ui";
import { Artwork } from "../components/ui/Avatar";
import { PlusIcon, LibraryIcon } from "../components/icons/Icons";
import type { Playlist } from "../types";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Your Library - Sonare" },
    { name: "description", content: "Your music library on Sonare" },
  ];
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await playlistsApi.getPlaylists({ limit: 50 });
        setPlaylists(response.data || []);
      } catch (err) {
        console.error("Failed to fetch playlists:", err);
        setError("Failed to load your library. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = () => {
    // TODO: Implement playlist creation modal
    console.log("Create playlist");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-surface-100">Your Library</h1>
        <Button onClick={handleCreatePlaylist}>
          <PlusIcon size={20} />
          Create Playlist
        </Button>
      </div>

      {/* Playlists grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              hover
              className="group"
              onClick={() => navigate(`/app/playlists/${playlist.id}`)}
            >
              <div className="relative mb-3">
                <Artwork
                  alt={playlist.name}
                  size="full"
                  rounded="md"
                  className="shadow-lg"
                />
              </div>
              <h3 className="font-medium text-surface-100 truncate">
                {playlist.name}
              </h3>
              <p className="text-sm text-surface-400">Playlist</p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <LibraryIcon size={64} className="mx-auto text-surface-600 mb-4" />
          <h2 className="text-xl font-bold text-surface-100 mb-2">
            Create your first playlist
          </h2>
          <p className="text-surface-400 mb-6">
            It's easy, we'll help you
          </p>
          <Button onClick={handleCreatePlaylist}>
            <PlusIcon size={20} />
            Create Playlist
          </Button>
        </div>
      )}
    </div>
  );
}
