import { usePlayer } from "../../context/PlayerContext";
import { IconButton } from "../ui";
import { Artwork } from "../ui/Avatar";
import {
  PlayIcon,
  PauseIcon,
  SkipNextIcon,
  SkipPreviousIcon,
  VolumeUpIcon,
  VolumeMuteIcon,
  ShuffleIcon,
  RepeatIcon,
  RepeatOneIcon,
  QueueMusicIcon,
} from "../icons/Icons";

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    repeatMode,
    shuffle,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleRepeat,
    toggleShuffle,
  } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface-900 border-t border-surface-800 flex items-center justify-center text-surface-500">
        <p className="text-sm">Select a track to start playing</p>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface-900/95 backdrop-blur-lg border-t border-surface-800 z-40">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center gap-4">
        {/* Left: Track info */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <Artwork
            src={currentTrack.thumbnail}
            alt={currentTrack.name}
            size="md"
            rounded="sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-surface-100 truncate">
              {currentTrack.name}
            </p>
            <p className="text-xs text-surface-400 truncate">
              {currentTrack.album?.name || "Unknown Album"}
            </p>
          </div>
        </div>

        {/* Center: Player controls */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-md">
          {/* Control buttons */}
          <div className="flex items-center gap-2">
            <IconButton
              onClick={toggleShuffle}
              aria-label="Toggle shuffle"
              size="sm"
              className={shuffle ? "text-primary-500" : ""}
            >
              <ShuffleIcon size={18} />
            </IconButton>

            <IconButton onClick={previous} aria-label="Previous track">
              <SkipPreviousIcon size={22} />
            </IconButton>

            <IconButton
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              variant="primary"
              size="lg"
            >
              {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
            </IconButton>

            <IconButton onClick={next} aria-label="Next track">
              <SkipNextIcon size={22} />
            </IconButton>

            <IconButton
              onClick={toggleRepeat}
              aria-label={`Repeat mode: ${repeatMode}`}
              size="sm"
              className={repeatMode !== "off" ? "text-primary-500" : ""}
            >
              {repeatMode === "one" ? (
                <RepeatOneIcon size={18} />
              ) : (
                <RepeatIcon size={18} />
              )}
            </IconButton>
          </div>

          {/* Progress bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-surface-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1 bg-surface-600 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-surface-100 group-hover:bg-primary-500 rounded-full relative transition-colors"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-surface-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-surface-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume and queue */}
        <div className="hidden md:flex items-center gap-2 w-[30%] justify-end">
          <IconButton aria-label="Queue" size="sm">
            <QueueMusicIcon size={18} />
          </IconButton>

          <div className="flex items-center gap-2 w-32">
            <IconButton
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              aria-label={volume === 0 ? "Unmute" : "Mute"}
              size="sm"
            >
              {volume === 0 ? (
                <VolumeMuteIcon size={18} />
              ) : (
                <VolumeUpIcon size={18} />
              )}
            </IconButton>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-primary-500"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
