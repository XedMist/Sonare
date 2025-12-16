import { useRef, useEffect } from "react";
import { animate } from "animejs";
import type { Track } from "~/lib/api";
import { cn } from "~/lib/utils";

interface TrackCardProps {
    track: Track;
    index?: number;
    isPlaying?: boolean;
    isCurrentTrack?: boolean;
    onPlay: (track: Track) => void;
    onAddToQueue?: (track: Track) => void;
    onAddToFavorites?: (track: Track) => void;
    onAddToPlaylist?: (track: Track) => void;
    showAlbum?: boolean;
    showArtist?: boolean;
}

function formatDuration(seconds?: number): string {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TrackCard({
    track,
    index,
    isPlaying,
    isCurrentTrack,
    onPlay,
    onAddToQueue,
    onAddToFavorites,
    onAddToPlaylist,
    showAlbum = true,
    showArtist = true,
}: TrackCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const playButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (cardRef.current) {
            animate(cardRef.current, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                ease: "outCubic",
                delay: (index ?? 0) * 50,
            });
        }
    }, [index]);

    const handlePlayClick = () => {
        if (playButtonRef.current) {
            animate(playButtonRef.current, {
                scale: [1, 0.9, 1],
                duration: 200,
                ease: "outCubic",
            });
        }
        onPlay(track);
    };

    return (
        <div
            ref={cardRef}
            className={cn(
                "group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                "hover:bg-surface-700/50",
                isCurrentTrack && "bg-surface-700/70 border-l-2 border-primary-500"
            )}
            onClick={handlePlayClick}
        >
            {/* Track number or playing indicator */}
            <div className="w-8 flex-shrink-0 text-center">
                {isPlaying && isCurrentTrack ? (
                    <div className="flex items-center justify-center gap-0.5">
                        <span className="w-1 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                ) : (
                    <span className="text-surface-400 text-sm group-hover:hidden">
                        {index !== undefined ? index + 1 : "•"}
                    </span>
                )}
                <button
                    ref={playButtonRef}
                    className={cn(
                        "hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full",
                        "bg-primary-500 text-white hover:bg-primary-400 hover:scale-105 transition-all"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePlayClick();
                    }}
                >
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            </div>

            {/* Thumbnail */}
            <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-surface-700">
                {track.thumbnail ? (
                    <img
                        src={track.thumbnail}
                        alt={track.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-500">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "font-medium truncate",
                    isCurrentTrack ? "text-primary-400" : "text-surface-50"
                )}>
                    {track.name}
                </p>
                <p className="text-sm text-surface-400 truncate">
                    {showAlbum && track.album?.name}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onAddToFavorites && (
                    <button
                        className="p-2 text-surface-400 hover:text-primary-400 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToFavorites(track);
                        }}
                        title="Add to favorites"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                )}
                {onAddToQueue && (
                    <button
                        className="p-2 text-surface-400 hover:text-surface-50 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToQueue(track);
                        }}
                        title="Add to queue"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Duration */}
            <span className="text-sm text-surface-400 w-12 text-right flex-shrink-0">
                {formatDuration(track.duration)}
            </span>
        </div>
    );
}

export default TrackCard;
