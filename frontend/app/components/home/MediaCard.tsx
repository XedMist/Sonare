import { useRef, useEffect } from "react";
import { animate } from "animejs";
import { Card } from "../ui";
import { Artwork } from "../ui/Avatar";
import { PlayIcon } from "../icons/Icons";

interface MediaCardProps {
  title: string;
  subtitle?: string;
  image?: string | null;
  onClick: () => void;
  onPlay?: () => void;
  rounded?: "md" | "full";
  index?: number;
}

export function MediaCard({
  title,
  subtitle,
  image,
  onClick,
  onPlay,
  rounded = "md",
  index = 0,
}: MediaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: index * 50,
        easing: "easeOutExpo",
        duration: 600,
      });
    }
  }, [index]);

  return (
    <div ref={cardRef} style={{ opacity: 0 }}>
      <Card hover className="group relative overflow-hidden" onClick={onClick}>
        <div className="relative mb-3">
          <Artwork
            src={image}
            alt={title}
            size="full"
            rounded={rounded}
            className="shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {onPlay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-primary-400"
              aria-label={`Reproducir ${title}`}
            >
              <PlayIcon size={24} className="text-surface-900 ml-1" />
            </button>
          )}
        </div>
        <h3 className="font-medium text-surface-100 truncate">{title}</h3>
        {subtitle && (
          <p className="text-sm text-surface-400 truncate mt-1">{subtitle}</p>
        )}
      </Card>
    </div>
  );
}
