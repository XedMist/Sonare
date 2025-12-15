import { useRef, useEffect, useState } from "react";
import { Link } from "react-router";
import { animate } from "animejs";
import { usePlayer } from "~/context/PlayerContext";
import { Slider } from "~/components/ui/Slider";
import { cn } from "~/lib/utils";
import { LyricsView } from "./player/LyricsView";

// Format seconds to mm:ss
function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
    const player = usePlayer();
    const playerRef = useRef<HTMLDivElement>(null);
    const albumArtRef = useRef<HTMLDivElement>(null);
    const [showVolume, setShowVolume] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volumeBeforeMute, setVolumeBeforeMute] = useState(1);
    const [showLyrics, setShowLyrics] = useState(false);

    // Animate player on mount
    useEffect(() => {
        if (playerRef.current) {
            animate(playerRef.current, {
                translateY: [100, 0],
                opacity: [0, 1],
                duration: 600,
                ease: "outCubic",
            });
        }
    }, []);

    // Animate album art on track change
    useEffect(() => {
        if (albumArtRef.current && player.currentTrack) {
            animate(albumArtRef.current, {
                scale: [0.8, 1],
                rotate: ["-10deg", "0deg"],
                opacity: [0, 1],
                duration: 400,
                ease: "outBack",
            });
        }
    }, [player.currentTrack?.id]);

    // Toggle play/pause
    const handlePlayPause = () => {
        player.togglePlay();
    };

    // Toggle mute
    const handleToggleMute = () => {
        if (isMuted) {
            player.setVolume(volumeBeforeMute);
            setIsMuted(false);
        } else {
            setVolumeBeforeMute(player.volume);
            player.setVolume(0);
            setIsMuted(true);
        }
    };

    // Handle volume change
    const handleVolumeChange = (value: number) => {
        player.setVolume(value);
        if (value > 0) setIsMuted(false);
    };

    if (!player.currentTrack) {
        return null;
    }

    // Get artist info from the album if available
    const artistName = player.currentTrack.album?.artistID ? undefined : undefined;

    return (
        <>
            {/* Lyrics View Overlay */}
            {showLyrics && (
                <div className="fixed inset-0 z-40 bg-surface-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-10 duration-300 md:pb-24">
                   <div className="container mx-auto h-full max-w-4xl">
                        <LyricsView 
                            trackID={player.currentTrack.id}
                            currentTime={player.currentTime}
                            onClose={() => setShowLyrics(false)}
                            className="bg-transparent"
                        />
                   </div>
                </div>
            )}

            <div
                ref={playerRef}
                className="fixed bottom-0 left-0 right-0 h-24 bg-surface-900/95 backdrop-blur-xl border-t border-surface-700/50 z-50"
            >
                <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center gap-4">
                    {/* Track info */}
                    <div className="flex items-center gap-4 min-w-[200px] w-[30%]">
                        <div
                            ref={albumArtRef}
                            className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg group relative cursor-pointer"
                            onClick={() => setShowLyrics(!showLyrics)}
                        >
                            {player.currentTrack.thumbnail ? (
                                <img
                                    src={player.currentTrack.thumbnail}
                                    alt={player.currentTrack.name}
                                    className={cn(
                                        "w-full h-full object-cover transition-transform duration-300",
                                        player.isPlaying && "animate-pulse"
                                    )}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-surface-50 font-medium truncate">
                                {player.currentTrack.name}
                            </p>
                            {player.currentTrack.album && (
                                <p className="text-surface-400 text-sm truncate">
                                    <Link
                                        to={`/app/albums/${player.currentTrack.album.id}`}
                                        className="hover:text-surface-200 hover:underline"
                                    >
                                        {player.currentTrack.album.name}
                                    </Link>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Main controls */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 max-w-xl">
                        {/* Playback buttons */}
                        <div className="flex items-center gap-4">
                            {/* Shuffle */}
                            <button
                                onClick={player.toggleShuffle}
                                className={cn(
                                    "p-2 transition-colors",
                                    player.shuffle ? "text-primary-400" : "text-surface-400 hover:text-surface-200"
                                )}
                                title="Shuffle"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                                </svg>
                            </button>

                            {/* Previous */}
                            <button
                                onClick={player.previous}
                                className="p-2 text-surface-300 hover:text-surface-50 transition-colors"
                                title="Previous"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                </svg>
                            </button>

                            {/* Play/Pause */}
                            <button
                                onClick={handlePlayPause}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                    "bg-surface-50 text-surface-900 hover:scale-105"
                                )}
                            >
                                {player.isPlaying ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Next */}
                            <button
                                onClick={player.next}
                                className="p-2 text-surface-300 hover:text-surface-50 transition-colors"
                                title="Next"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                </svg>
                            </button>

                            {/* Repeat */}
                            <button
                                onClick={player.toggleRepeat}
                                className={cn(
                                    "p-2 transition-colors relative",
                                    player.repeatMode !== "off" ? "text-primary-400" : "text-surface-400 hover:text-surface-200"
                                )}
                                title={`Repeat: ${player.repeatMode}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                                </svg>
                                {player.repeatMode === "one" && (
                                    <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
                                )}
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full flex items-center gap-3">
                            <span className="text-xs text-surface-400 w-10 text-right">
                                {formatTime(player.currentTime)}
                            </span>
                            <Slider
                                value={player.currentTime}
                                max={player.duration || 100}
                                onChange={(value) => player.seek(value)}
                                className="flex-1"
                            />
                            <span className="text-xs text-surface-400 w-10">
                                {formatTime(player.duration)}
                            </span>
                        </div>
                    </div>

                    {/* Volume & extras */}
                    <div className="flex items-center gap-3 min-w-[180px] w-[30%] justify-end">
                        {/* Lyrics Toggle */}
                        <button
                            onClick={() => setShowLyrics(!showLyrics)}
                            className={cn(
                                "p-2 transition-colors",
                                showLyrics ? "text-primary-400" : "text-surface-400 hover:text-surface-200"
                            )}
                            title="Lyrics"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.66 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        </button>

                        {/* Queue indicator */}
                        {player.queue.length > 1 && (
                            <span className="text-xs text-surface-400 bg-surface-700 px-2 py-1 rounded-full">
                                {player.currentIndex + 1}/{player.queue.length}
                            </span>
                        )}

                        {/* Volume control */}
                        <div
                            className="relative flex items-center"
                            onMouseEnter={() => setShowVolume(true)}
                            onMouseLeave={() => setShowVolume(false)}
                        >
                            <button
                                onClick={handleToggleMute}
                                className="p-2 text-surface-400 hover:text-surface-200 transition-colors"
                            >
                                {isMuted || player.volume === 0 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                    </svg>
                                ) : player.volume < 0.5 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                    </svg>
                                )}
                            </button>

                            <div
                                className={cn(
                                    "w-24 transition-all duration-200",
                                    showVolume ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                                )}
                            >
                                <Slider
                                    value={isMuted ? 0 : player.volume}
                                    max={1}
                                    onChange={handleVolumeChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AudioPlayer;
