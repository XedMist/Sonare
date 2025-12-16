import { useRef, useEffect } from "react";
import { Link } from "react-router";
import { animate } from "animejs";
import type { Album } from "~/lib/api";
import { cn } from "~/lib/utils";

interface AlbumCardProps {
    album: Album;
    index?: number;
    onPlay?: (album: Album) => void;
    className?: string;
    thumbnail?: string;
}

export function AlbumCard({ album, index, onPlay, className, thumbnail }: AlbumCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const coverImage = thumbnail || (album as Album & { thumbnail?: string }).thumbnail;

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
            <Link to={`/app/albums/${album.id}`} className="block">
                {/* Album art */}
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg shadow-black/40">
                    {coverImage ? (
                        <img
                            src={coverImage}
                            alt={album.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-surface-600 to-surface-700 flex items-center justify-center">
                            <svg className="w-16 h-16 text-surface-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                            </svg>
                        </div>
                    )}

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
                                onPlay(album);
                            }}
                        >
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Album info */}
                <h3 className="font-semibold text-surface-50 truncate mb-1">
                    {album.name}
                </h3>
                <p className="text-sm text-surface-400 truncate">
                    {album.artist?.name || "Unknown Artist"}
                    {album.releaseYear && ` • ${album.releaseYear}`}
                </p>
            </Link>
        </div>
    );
}

export default AlbumCard;
