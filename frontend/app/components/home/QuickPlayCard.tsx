import { useRef, useEffect } from "react";
import { animate, stagger } from "animejs";
import { Artwork } from "../ui/Avatar";
import { PlayIcon } from "../icons/Icons";
import type { Track } from "../../types";

interface QuickPlayCardProps {
  track: Track;
  onPlay: () => void;
  index?: number;
}

export function QuickPlayCard({ track, onPlay, index = 0 }: QuickPlayCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: index * 80,
        easing: "easeOutExpo",
        duration: 500,
      });
    }
  }, [index]);

  return (
    <button
      ref={cardRef}
      onClick={onPlay}
      className="flex items-center gap-4 bg-surface-800/60 hover:bg-surface-700 rounded-lg overflow-hidden group transition-all duration-300 text-left hover:shadow-lg hover:shadow-primary-500/5"
      style={{ opacity: 0 }}
    >
      <Artwork
        src={track.thumbnail}
        alt={track.name}
        size="md"
        rounded="sm"
        className="w-16 h-16 flex-shrink-0"
      />
      <div className="flex-1 min-w-0 pr-2">
        <span className="font-medium text-surface-100 truncate block">
          {track.name}
        </span>
        <span className="text-sm text-surface-400 truncate block">
          {track.album?.name || "Álbum desconocido"}
        </span>
      </div>
      <div className="ml-auto pr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
          <PlayIcon size={20} className="text-surface-900 ml-0.5" />
        </div>
      </div>
    </button>
  );
}

interface QuickPlayGridProps {
  tracks: Track[];
  onPlay: (track: Track) => void;
  isLoading?: boolean;
}

export function QuickPlayGrid({ tracks, onPlay, isLoading }: QuickPlayGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && gridRef.current) {
      animate(gridRef.current.querySelectorAll(".skeleton-card"), {
        opacity: [1, 0],
        duration: 300,
        easing: "easeOutQuad",
      });
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-card flex items-center gap-4 bg-surface-800/50 rounded-lg overflow-hidden h-16 animate-pulse"
          >
            <div className="w-16 h-16 bg-surface-700" />
            <div className="flex-1 space-y-2 pr-4">
              <div className="h-4 bg-surface-700 rounded w-32" />
              <div className="h-3 bg-surface-700 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {tracks.slice(0, 6).map((track, index) => (
        <QuickPlayCard
          key={track.id}
          track={track}
          onPlay={() => onPlay(track)}
          index={index}
        />
      ))}
    </div>
  );
}
