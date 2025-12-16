import { useRef, useEffect } from "react";
import { Link } from "react-router";
import { animate } from "animejs";
import type { Artist } from "~/lib/api";
import { cn } from "~/lib/utils";

interface ArtistCardProps {
    artist: Artist;
    index?: number;
    className?: string;
}

export function ArtistCard({ artist, index, className }: ArtistCardProps) {
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
    
    const getArtistColor = (name: string) => {
        const colors = [
            "from-purple-600 to-blue-600",
            "from-pink-600 to-purple-600",
            "from-blue-600 to-cyan-600",
            "from-green-600 to-teal-600",
            "from-orange-600 to-red-600",
            "from-yellow-600 to-orange-600",
            "from-teal-600 to-green-600",
            "from-red-600 to-pink-600",
        ];
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
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
            <Link to={`/app/artists/${artist.id}`} className="block">
                {/* Artist avatar */}
                <div className="relative aspect-square rounded-full overflow-hidden mb-4 shadow-lg shadow-black/40 mx-auto max-w-[160px]">
                    <div className={cn(
                        "w-full h-full bg-gradient-to-br flex items-center justify-center",
                        getArtistColor(artist.name)
                    )}>
                        <span className="text-4xl font-bold text-white">
                            {artist.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Artist info */}
                <h3 className="font-semibold text-surface-50 truncate text-center mb-1">
                    {artist.name}
                </h3>
                <p className="text-sm text-surface-400 text-center">
                    Artist
                </p>
            </Link>
        </div>
    );
}

export default ArtistCard;
