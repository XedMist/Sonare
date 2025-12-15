import { useEffect, useState, useRef, useMemo } from "react";
import { lyricsApi } from "~/api/lyrics";
import { cn } from "~/lib/utils";
import type { LyricsResponse } from "~/types";

interface LyricsViewProps {
    trackID: string;
    currentTime: number;
    onClose: () => void;
    className?: string;
}

interface LyricLine {
    time: number;
    text: string;
}

interface LyricMetadata {
    artist?: string;
    title?: string;
    album?: string;
    [key: string]: string | undefined;
}

interface ParsedLyrics {
    lines: LyricLine[];
    metadata: LyricMetadata;
    isSynced: boolean;
}

function parseLRC(lrc: string): ParsedLyrics {
    const lines = lrc.split("\n");
    const result: LyricLine[] = [];
    const metadata: LyricMetadata = {};
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    const metaRegex = /\[([a-zA-Z]+):([^\]]+)\]/;
    let hasTimeTags = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check for metadata
        const metaMatch = trimmed.match(metaRegex);
        if (metaMatch) {
            const [_, key, value] = metaMatch;
            metadata[key.toLowerCase()] = value.trim();
            continue;
        }

        // Check for time tags
        const timeMatch = trimmed.match(timeRegex);
        if (timeMatch) {
            hasTimeTags = true;
            const minutes = parseInt(timeMatch[1], 10);
            const seconds = parseInt(timeMatch[2], 10);
            const milliseconds = parseInt(timeMatch[3], 10);
            
            // Convert to seconds
            const time = minutes * 60 + seconds + milliseconds / (timeMatch[3].length === 3 ? 1000 : 100);
            const text = trimmed.replace(timeRegex, "").trim();
            
            if (text) {
                result.push({ time, text });
            }
        } else {
            // Line without time tag
            // We'll add them with time -1 for now
            result.push({ time: -1, text: trimmed });
        }
    }

    return {
        lines: result,
        metadata,
        isSynced: hasTimeTags
    };
}

export function LyricsView({ trackID, currentTime, onClose, className }: LyricsViewProps) {
    const [lyrics, setLyrics] = useState<LyricsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const activeLineRef = useRef<HTMLParagraphElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // State for parsed lyrics
    const [parsedData, setParsedData] = useState<ParsedLyrics>({ lines: [], metadata: {}, isSynced: false });

    useEffect(() => {
        let mounted = true;
        
        async function fetchLyrics() {
            if (!trackID) return;
            
            try {
                setLoading(true);
                setError(null);
                const data = await lyricsApi.getLyrics(trackID);
                if (mounted) {
                    setLyrics(data);
                }
            } catch (err) {
                if (mounted) {
                    setLyrics(null);
                    setError("No lyrics available");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchLyrics();
        
        return () => {
            mounted = false;
        };
    }, [trackID]);

    useEffect(() => {
        if (lyrics?.syncedLyrics) {
            setParsedData(parseLRC(lyrics.syncedLyrics));
        } else {
            setParsedData({ lines: [], metadata: {}, isSynced: false });
        }
    }, [lyrics]);

    const { lines, metadata, isSynced } = parsedData;

    const activeIndex = useMemo(() => {
        if (!lines.length || !isSynced) return -1;
        // Find the last line that has started
        return lines.findIndex((line, index) => {
            const nextLine = lines[index + 1];
            // Only consider lines with valid time for syncing logic
            const currentLineTime = line.time !== -1 ? line.time : -1;
            const nextLineTime = nextLine && nextLine.time !== -1 ? nextLine.time : Infinity;
            
            if (currentLineTime === -1) return false;

            return currentTime >= currentLineTime && currentTime < nextLineTime;
        });
    }, [lines, currentTime, isSynced]);

    // Auto-scroll
    useEffect(() => {
        if (activeIndex !== -1 && activeLineRef.current && isSynced) {
            activeLineRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [activeIndex, isSynced]);

    return (
        <div className={cn("flex flex-col h-full relative", className)}>
            <div className="flex items-center justify-between p-6 border-b border-surface-800/50 bg-surface-900/95 backdrop-blur-md z-10 sticky top-0">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold tracking-tight">
                        {metadata.title || "Lyrics"}
                    </h2>
                    {(metadata.artist || metadata.album) && (
                        <p className="text-sm text-surface-400">
                             {metadata.artist}
                             {metadata.artist && metadata.album && " • "}
                             {metadata.album}
                        </p>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-surface-800 rounded-full transition-colors text-surface-400 hover:text-surface-200"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div 
                ref={containerRef}
                className="flex-1 overflow-y-auto px-6 py-10 space-y-8 scroll-smooth no-scrollbar"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                ) : error || !lyrics ? (
                    <div className="flex flex-col items-center justify-center h-full text-surface-500">
                        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <p className="text-lg font-medium">{error || "No lyrics available"}</p>
                    </div>
                ) : (
                    lines.length > 0 ? (
                        lines.map((line, index) => {
                            const isActive = isSynced && index === activeIndex;
                            const isPast = isSynced && index < activeIndex;
                            
                            return (
                                <p
                                    key={index}
                                    ref={isActive ? activeLineRef : null}
                                    className={cn(
                                        "text-xl md:text-3xl font-bold transition-all duration-500 cursor-pointer origin-left",
                                        isSynced 
                                            ? (isActive ? "text-primary-400 scale-105" : isPast ? "text-surface-600" : "text-surface-400")
                                            : "text-surface-200", // Unsynced style
                                        "hover:text-surface-200"
                                    )}
                                    onClick={() => {
                                        // TODO: Implement seek to line on click
                                    }}
                                >
                                    {line.text}
                                </p>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-surface-500 italic">Instrumental or empty lyrics</p>
                        </div>
                    )
                )}
            </div>
            
            {/* Attribution if needed */}
            {lyrics && (
                <div className="p-4 text-center text-xs text-surface-600 bg-surface-900/50 backdrop-blur-sm">
                    Lyrics provided by Sonare
                </div>
            )}
        </div>
    );
}
