import { useRef, type MouseEvent } from "react";

interface SliderProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({ value, max, onChange, className = "" }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onChange(percentage * max);
  };

  const progress = max > 0 ? (value / max) * 100 : 0;

  return (
    <div
      ref={trackRef}
      className={`relative h-1 bg-surface-600 rounded-full cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      <div
        className="h-full bg-surface-100 group-hover:bg-primary-500 rounded-full transition-colors"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-surface-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
