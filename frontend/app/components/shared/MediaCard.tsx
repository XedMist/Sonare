import { memo } from "react";
import { useNavigate } from "react-router";
import { Card } from "../ui";
import { Artwork } from "../ui/Avatar";
import { PlayIcon } from "../icons/Icons";
import type { Album, Artist, Playlist } from "../../types";

interface MediaCardProps {
  type: "album" | "artist" | "playlist";
  id: string;
  name: string;
  subtitle?: string;
  artwork?: string | null;
  onPlay?: () => void;
}

export const MediaCard = memo(function MediaCard({ type, id, name, subtitle, artwork, onPlay }: MediaCardProps) {
  const navigate = useNavigate();

  const routes = {
    album: `/app/albums/${id}`,
    artist: `/app/artists/${id}`,
    playlist: `/app/playlists/${id}`,
  };

  const defaultSubtitles = {
    album: subtitle || "Album",
    artist: "Artist",
    playlist: "Playlist",
  };

  const handleClick = () => navigate(routes[type]);

  return (
    <Card hover className="group" onClick={handleClick}>
      <div className="relative mb-3">
        <Artwork
          src={artwork}
          alt={name}
          size="full"
          rounded={type === "artist" ? "full" : "md"}
          className="shadow-lg"
          loading="lazy"
        />
        {onPlay && (
          <button
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105 hover:bg-primary-400"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            aria-label={`Play ${name}`}
          >
            <PlayIcon size={20} className="text-surface-900" />
          </button>
        )}
      </div>
      <h3 className="font-medium text-surface-100 truncate">{name}</h3>
      <p className="text-sm text-surface-400 truncate">{defaultSubtitles[type]}</p>
    </Card>
  );
});
