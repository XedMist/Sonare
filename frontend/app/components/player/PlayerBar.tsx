import { usePlayer } from "../../context/PlayerContext";
import { IconButton, Badge, Slider } from "../ui";
import { Artwork } from "../ui/Avatar";
import { getTrackThumbnailUrl } from "../../api/tracks";
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
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface-900/95 backdrop-blur-xl border-t border-surface-700/60 flex items-center justify-center">
        <p className="text-sm text-surface-500">Select a track to start playing</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface-900/95 backdrop-blur-xl border-t border-surface-700/60 z-40">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <Artwork
            src={getTrackThumbnailUrl(currentTrack.id)}
            alt={currentTrack.name}
            size="md"
            rounded="sm"
            className="shadow-lg shadow-black/30"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-surface-100 truncate">
              {currentTrack.name}
            </p>
            <p className="text-xs text-surface-400 truncate">
              {currentTrack.album?.name || "Unknown Album"}
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex ml-2">
            Playing
          </Badge>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1 max-w-md">
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
              className="hover:scale-105 transition-transform"
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

          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-surface-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={currentTime}
              max={duration || 100}
              onChange={seek}
              className="flex-1"
            />
            <span className="text-xs text-surface-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

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
            <Slider
              value={volume}
              max={1}
              onChange={setVolume}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
