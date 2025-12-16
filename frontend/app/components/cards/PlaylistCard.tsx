import { useRef, useEffect } from "react";
import { Link } from "react-router";
import { animate } from "animejs";
import type { Playlist } from "~/lib/api";
import { cn } from "~/lib/utils";

interface PlaylistCardProps {
    playlist: Playlist;
    index?: number;
    onPlay?: (playlist: Playlist) => void;
    className?: string;
}

export function PlaylistCard({ playlist, index, onPlay, className }: PlaylistCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cardRef.current) {
            animate(cardRef.current, {
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 500,
                ease: "outCubic",
                delay: (index ?? 0) * 80,
            });
        }
    }, [index]);

    const handleMouseEnter = () => {
        if (cardRef.current) {
            animate(cardRef.current, {
                scale: 1.02,
                duration: 200,
                ease: "outCubic",
            });
        }
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            animate(cardRef.current, {
                scale: 1,
                duration: 200,
                ease: "outCubic",
            });
        }
    };

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

    const trackCount = playlist.tracks?.length || 0;

    return (
        <div
            ref={cardRef}
            className={cn(
                "group relative p-4 rounded-xl bg-surface-800/40 hover:bg-surface-700/60 transition-colors cursor-pointer",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link to={`/app/playlists/${playlist.id}`} className="block">
                {/* Playlist cover */}
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg shadow-black/40">
                    <div className={cn(
                        "w-full h-full bg-gradient-to-br flex items-center justify-center",
                        getPlaylistGradient(playlist.name)
                    )}>
                        <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                    </div>

                    {/* Play button overlay */}
                    {onPlay && (
                        <button
                            className={cn(
                                "absolute bottom-2 right-2 w-12 h-12 rounded-full flex items-center justify-center",
                                "bg-primary-500 text-white shadow-xl shadow-primary-500/40",
                                "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
                                "hover:bg-primary-400 hover:scale-105 transition-all duration-300"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPlay(playlist);
                            }}
                        >
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Playlist info */}
                <h3 className="font-semibold text-surface-50 truncate mb-1">
                    {playlist.name}
                </h3>
                <p className="text-sm text-surface-400 truncate">
                    {trackCount} {trackCount === 1 ? "track" : "tracks"}
                </p>
            </Link>
        </div>
    );
}

export default PlaylistCard;
