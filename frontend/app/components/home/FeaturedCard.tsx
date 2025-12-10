import { useRef, useState } from "react";
import { animate } from "animejs";
import { PlayIcon } from "../icons/Icons";
import { Artwork } from "../ui/Avatar";

interface FeaturedCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string | null;
  onClick: () => void;
  onPlay?: () => void;
  rounded?: "md" | "full";
  variant?: "default" | "featured";
}

export function FeaturedCard({
  title,
  subtitle,
  description,
  image,
  onClick,
  onPlay,
  rounded = "md",
  variant = "default",
}: FeaturedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (playButtonRef.current) {
      animate(playButtonRef.current, {
        translateY: [8, 0],
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 300,
        ease: "outQuad",
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (playButtonRef.current) {
      animate(playButtonRef.current, {
        translateY: [0, 8],
        opacity: [1, 0],
        scale: [1, 0.8],
        duration: 200,
        ease: "inQuad",
      });
    }
  };

  if (variant === "featured") {
    return (
      <div
        ref={cardRef}
        className="media-card relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-800 to-surface-800/50 border border-surface-700/30 cursor-pointer group opacity-0"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="relative flex-shrink-0">
            <Artwork
              src={image}
              alt={title}
              size="full"
              rounded={rounded}
              className="w-full sm:w-32 h-32 shadow-xl"
            />
            {/* Glow effect */}
            <div
              className={`absolute inset-0 ${rounded === "full" ? "rounded-full" : "rounded-md"} bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
            />
          </div>
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <span className="text-xs uppercase tracking-wider text-primary-400 font-semibold mb-1">
              {subtitle}
            </span>
            <h3 className="font-bold text-xl text-surface-50 truncate mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-surface-400 text-sm line-clamp-2">
                {description}
              </p>
            )}
          </div>
          {onPlay && (
            <button
              ref={playButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className="absolute bottom-4 right-4 w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center shadow-xl shadow-primary-500/40 hover:scale-105 hover:bg-primary-400 transition-transform opacity-0"
              aria-label={`Reproducir ${title}`}
            >
              <PlayIcon size={28} className="text-surface-900 ml-1" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="media-card bg-surface-800/60 rounded-lg p-3 sm:p-4 cursor-pointer group hover:bg-surface-700/70 transition-all duration-300 border border-transparent hover:border-surface-600/30 opacity-0"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative mb-3 sm:mb-4">
        <Artwork
          src={image}
          alt={title}
          size="full"
          rounded={rounded}
          className="shadow-lg group-hover:shadow-xl group-hover:shadow-black/30 transition-shadow duration-300"
        />
        {/* Overlay gradient on hover */}
        <div
          className={`absolute inset-0 ${rounded === "full" ? "rounded-full" : "rounded-md"} bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />
        {onPlay && (
          <button
            ref={playButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-110 hover:bg-primary-400 transition-all duration-200 opacity-0"
            aria-label={`Reproducir ${title}`}
          >
            <PlayIcon size={22} className="text-surface-900 ml-0.5" />
          </button>
        )}
      </div>
      <h3 className="font-semibold text-surface-100 truncate text-sm sm:text-base">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-surface-400 truncate mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// Skeleton loader para las cards
export function FeaturedCardSkeleton({
  variant = "default",
}: {
  variant?: "default" | "featured";
}) {
  if (variant === "featured") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-surface-800/60 border border-surface-700/30 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="w-full sm:w-32 h-32 bg-surface-700 rounded-md" />
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-3 w-16 bg-surface-700 rounded mb-2" />
            <div className="h-6 w-3/4 bg-surface-700 rounded mb-2" />
            <div className="h-4 w-full bg-surface-700/50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-800/60 rounded-lg p-3 sm:p-4 animate-pulse">
      <div className="aspect-square bg-surface-700 rounded-md mb-3 sm:mb-4" />
      <div className="h-4 bg-surface-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-surface-700/50 rounded w-1/2" />
    </div>
  );
}
