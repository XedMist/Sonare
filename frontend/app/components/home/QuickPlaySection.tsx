import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { PlayIcon } from "../icons/Icons";
import { Artwork } from "../ui/Avatar";
import type { Track } from "../../types";

interface QuickPlaySectionProps {
  tracks: Track[];
  isLoading: boolean;
  onPlay: (track: Track) => void;
}

export function QuickPlaySection({ tracks, isLoading, onPlay }: QuickPlaySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading || !sectionRef.current) return;

    animate(".quick-play-card", {
      translateY: [20, 0],
      opacity: [0, 1],
      delay: stagger(80, { start: 200 }),
      duration: 500,
      ease: "outQuad",
    });
  }, [isLoading, tracks]);

  if (isLoading) {
    return (
      <section className="mb-10">
        <h2 className="text-xl font-bold text-surface-100 mb-4">
          Continúa escuchando
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-surface-800/50 rounded-lg overflow-hidden h-16 animate-pulse"
            >
              <div className="w-16 h-16 bg-surface-700" />
              <div className="flex-1 pr-4">
                <div className="h-4 bg-surface-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-700/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <section ref={sectionRef} className="mb-10">
      <h2 className="text-xl font-bold text-surface-100 mb-4">
        Continúa escuchando
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tracks.slice(0, 6).map((track) => (
          <button
            key={track.id}
            onClick={() => onPlay(track)}
            className="quick-play-card flex items-center gap-4 bg-surface-800/60 hover:bg-surface-700/80 rounded-lg overflow-hidden group transition-all duration-300 text-left opacity-0 border border-transparent hover:border-surface-600/50"
          >
            <div className="relative flex-shrink-0">
              <Artwork
                src={track.thumbnail}
                alt={track.name}
                size="md"
                rounded="sm"
                className="w-16 h-16"
              />
              {/* Overlay de play en hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <PlayIcon size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <span className="font-medium text-surface-100 truncate block">
                {track.name}
              </span>
              <span className="text-sm text-surface-400 truncate block">
                {track.album?.name || "Álbum desconocido"}
              </span>
            </div>
            <div className="pr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                <PlayIcon size={18} className="text-surface-900 ml-0.5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
