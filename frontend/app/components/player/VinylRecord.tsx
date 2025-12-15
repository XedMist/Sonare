import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface VinylRecordProps {
  src?: string;
  alt?: string;
  isPlaying?: boolean;
  className?: string;
}

export function VinylRecord({ src, alt, isPlaying = false, className }: VinylRecordProps) {
  return (
    <div className={cn("relative aspect-square flex items-center justify-center rounded-full bg-surface-950 shadow-2xl", className)}>
      
      {/* Spinning Container */}
      <div 
        className={cn(
            "relative w-full h-full rounded-full overflow-hidden", 
        )}
        style={{
            animation: "spin 4s linear infinite",
            animationPlayState: isPlaying ? "running" : "paused"
        }}
      >
        {/* Vinyl Texture / Dark Background for Picture Disc feel */}
        <div className="absolute inset-0 bg-surface-950" />

        {src ? (
          <img 
            src={src} 
            alt={alt || "Vinyl Record"} 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        ) : (
           <div className="absolute inset-0 bg-surface-800" />
        )}
        
        {/* Grooves Overlay - using radial gradient for smoother look */}
        <div 
            className="absolute inset-0 pointer-events-none"
            style={{
                background: "repeating-radial-gradient(#0000 0 2px, #00000020 3px 4px)"
            }}
        />

        {/* Center Hole / Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] h-[25%] bg-surface-950 rounded-full z-10 flex items-center justify-center shadow-lg">
           <div className="w-[30%] h-[30%] bg-black rounded-full" />
        </div>
      </div>
    </div>
  );
}
