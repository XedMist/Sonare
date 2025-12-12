import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { getTrackAudioUrl } from "../api/tracks";
import type { Track, RepeatMode } from "../types";

interface PlayerTrack extends Track {
  audioUrl: string;
}

interface PlayerContextType {
  // State
  queue: PlayerTrack[];
  currentTrack: PlayerTrack | null;
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  
  // Methods
  playTrack: (track: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

function trackToPlayerTrack(track: Track): PlayerTrack {
  return {
    ...track,
    audioUrl: "", // Will be fetched asynchronously
  };
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);

  // Use refs for values accessed in event handlers to avoid stale closures
  const repeatModeRef = useRef(repeatMode);
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  
  // Keep refs in sync
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const currentTrack = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  // Initialize audio element - only once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      const currentRepeatMode = repeatModeRef.current;
      const currentQueue = queueRef.current;
      const idx = currentIndexRef.current;
      
      if (currentRepeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else if (idx < currentQueue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (currentRepeatMode === "all" && currentQueue.length > 0) {
        setCurrentIndex(0);
      } else {
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []); // Empty deps - only run once

  // Update audio source when current track changes
  useEffect(() => {
    let isMounted = true;

    const fetchAudioUrl = async () => {
      if (audioRef.current && currentTrack) {
        try {
          // Only fetch if we don't have a URL yet or if it's a new track
          // Note: Since we reset audioUrl to "" in trackToPlayerTrack, we always fetch here.
          // You might want to cache this if needed, but presigned URLs expire.
          const url = await getTrackAudioUrl(currentTrack.id);
          
          if (isMounted) {
             audioRef.current.src = url;
             audioRef.current.load();
             if (isPlaying) {
               audioRef.current.play().catch(() => {
                 // Handle autoplay restrictions
                 setIsPlaying(false);
               });
             }
          }
        } catch (error) {
          console.error("Failed to fetch audio URL:", error);
          if (isMounted) setIsPlaying(false);
        }
      }
    };

    fetchAudioUrl();

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id]);

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    const playerTrack = trackToPlayerTrack(track);
    
    if (newQueue) {
      const playerQueue = newQueue.map(trackToPlayerTrack);
      const index = playerQueue.findIndex((t) => t.id === track.id);
      setQueue(playerQueue);
      setCurrentIndex(index >= 0 ? index : 0);
    } else {
      setQueue([playerTrack]);
      setCurrentIndex(0);
    }
    
    setIsPlaying(true);
  }, []);

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    const playerQueue = tracks.map(trackToPlayerTrack);
    setQueue(playerQueue);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentTrack) {
      setIsPlaying((prev) => !prev);
    }
  }, [currentTrack]);

  const next = useCallback(() => {
    if (shuffle && queue.length > 1) {
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === currentIndex);
      setCurrentIndex(randomIndex);
    } else if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (repeatMode === "all" && queue.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, queue.length, repeatMode, shuffle]);

  const previous = useCallback(() => {
    // If more than 3 seconds into the track, restart it
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (repeatMode === "all" && queue.length > 0) {
      setCurrentIndex(queue.length - 1);
    }
  }, [currentIndex, queue.length, repeatMode]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setVolumeState(clampedValue);
    if (audioRef.current) {
      audioRef.current.volume = clampedValue;
    }
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    const playerTrack = trackToPlayerTrack(track);
    setQueue((prev) => [...prev, playerTrack]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, []);

  const value: PlayerContextType = {
    queue,
    currentTrack,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    repeatMode,
    shuffle,
    playTrack,
    playQueue,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    addToQueue,
    clearQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
