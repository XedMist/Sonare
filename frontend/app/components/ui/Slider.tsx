import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

interface SliderProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({ value, max, onChange, className = "" }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampValue = useCallback(
    (nextValue: number) => {
      if (max <= 0) return 0;
      return Math.min(max, Math.max(0, nextValue));
    },
    [max]
  );

  const updateFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current || max <= 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = rect.width ? Math.max(0, Math.min(1, x / rect.width)) : 0;
      onChange(clampValue(percentage * max));
    },
    [clampValue, max, onChange]
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    trackRef.current?.focus({ preventScroll: true });
    setIsDragging(true);
    updateFromClientX(event.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: PointerEvent) => updateFromClientX(event.clientX);
    const handleUp = () => setIsDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointerleave", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointerleave", handleUp);
    };
  }, [isDragging, updateFromClientX]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (max <= 0) return;
    const step = max <= 1 ? 0.05 : Math.max(1, max / 100);

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onChange(clampValue(value - step));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onChange(clampValue(value + step));
    } else if (event.key === "Home") {
      event.preventDefault();
      onChange(0);
    } else if (event.key === "End") {
      event.preventDefault();
      onChange(max);
    }
  };

  const progress = max > 0 ? Math.max(0, Math.min(1, value / max)) * 100 : 0;

  return (
    <div
      ref={trackRef}
      className={`relative h-1 bg-surface-600 rounded-full cursor-pointer group ${className}`}
      onPointerDown={handlePointerDown}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(max, Math.max(0, value))}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="h-full bg-surface-100 group-hover:bg-primary-500 rounded-full transition-colors relative"
        style={{ width: `${progress}%` }}
      >
        <div
          className={`absolute left-full top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-surface-100 rounded-full pointer-events-none transition-opacity ${
            isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />
      </div>
    </div>
  );
}
