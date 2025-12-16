import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { animate } from "animejs";
import { albumsApi, artistsApi, playlistsApi, meApi, tracksApi, type Album, type Artist, type Playlist, type Track } from "~/lib/api";
import { usePlayer } from "~/context/PlayerContext";
import { AlbumCard, ArtistCard, PlaylistCard } from "~/components/cards";
import { CardGridSkeleton, EmptyState } from "~/components/LoadingStates";
import { Button } from "~/components/ui/Button";
import { cn } from "~/lib/utils";

interface SectionProps {
    title: string;
    linkTo?: string;
    linkText?: string;
    children: React.ReactNode;
    delay?: number;
}

function Section({ title, linkTo, linkText = "Ver más", children, delay = 0 }: SectionProps) {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (sectionRef.current) {
            animate(sectionRef.current, {
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 600,
                ease: "outCubic",
                delay,
            });
        }
    }, [delay]);

    return (
        <section ref={sectionRef} className="mb-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-surface-50">{title}</h2>
                {linkTo && (
                    <Link
                        to={linkTo}
                        className="text-sm text-surface-400 hover:text-surface-200 font-medium transition-colors"
                    >
                        {linkText}
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

export default function AppBrowsePage() {
    const player = usePlayer();
    const [albums, setAlbums] = useState<Album[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [albumThumbnails, setAlbumThumbnails] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (headerRef.current) {
            animate(headerRef.current, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                ease: "outCubic",
            });
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [albumsData, artistsData, playlistsData, tracksData] = await Promise.all([
                    albumsApi.list({ page: 0, limit: 12 }),
                    artistsApi.list({ page: 0, limit: 12 }),
                    meApi.getPlaylists({ page: 0, limit: 6 }),
                    tracksApi.list({ page: 0, limit: 100 }),
                ]);
                setAlbums(albumsData);
                setArtists(artistsData);
                setPlaylists(playlistsData);

                const thumbnailMap = new Map<string, string>();
                for (const track of tracksData) {
                    if (track.albumID && track.thumbnail && !thumbnailMap.has(track.albumID)) {
                        thumbnailMap.set(track.albumID, track.thumbnail);
                    }
                }
                setAlbumThumbnails(thumbnailMap);
            } catch (error) {
                console.error("Error fetching browse data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePlayAlbum = async (album: Album) => {
        try {
            const tracks = await albumsApi.getTracks(album.id, { page: 0, limit: 100 });
            if (tracks.length > 0) {
                player.playTracks(tracks);
            }
        } catch (error) {
            console.error("Error playing album:", error);
        }
    };

    const handlePlayPlaylist = async (playlist: Playlist) => {
        try {
            const fullPlaylist = await playlistsApi.get(playlist.id);
            if (fullPlaylist.tracks && fullPlaylist.tracks.length > 0) {
                player.playTracks(fullPlaylist.tracks);
            }
        } catch (error) {
            console.error("Error playing playlist:", error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Buenos días";
        if (hour < 18) return "Buenas tardes";
        return "Buenas noches";
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div ref={headerRef} className="mb-8">
                <h1 className="text-4xl font-bold text-surface-50 mb-2">
                    {getGreeting()}
                </h1>
                <p className="text-surface-400">
                    ¿Qué te apetece escuchar hoy?
                </p>
            </div>

            {/* Your Playlists */}
            {playlists.length > 0 && (
                <Section
                    title="Tus Playlists"
                    linkTo="/app/playlists"
                    delay={100}
                >
                    {isLoading ? (
                        <CardGridSkeleton count={6} type="playlist" />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {playlists.map((playlist, index) => (
                                <PlaylistCard
                                    key={playlist.id}
                                    playlist={playlist}
                                    index={index}
                                    onPlay={handlePlayPlaylist}
                                />
                            ))}
                        </div>
                    )}
                </Section>
            )}

            {/* Recent Albums */}
            <Section
                title="Álbumes Recientes"
                linkTo="/app/library?tab=albums"
                delay={200}
            >
                {isLoading ? (
                    <CardGridSkeleton count={6} type="album" />
                ) : albums.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {albums.slice(0, 6).map((album, index) => (
                            <AlbumCard
                                key={album.id}
                                album={album}
                                index={index}
                                onPlay={handlePlayAlbum}
                                thumbnail={albumThumbnails.get(album.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                            </svg>
                        }
                        title="No hay álbumes disponibles"
                        description="Los álbumes que agregues aparecerán aquí"
                    />
                )}
            </Section>

            {/* Artists */}
            <Section
                title="Artistas Populares"
                linkTo="/app/library?tab=artists"
                delay={300}
            >
                {isLoading ? (
                    <CardGridSkeleton count={6} type="artist" />
                ) : artists.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {artists.slice(0, 6).map((artist, index) => (
                            <ArtistCard
                                key={artist.id}
                                artist={artist}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        }
                        title="No hay artistas disponibles"
                        description="Los artistas que sigas aparecerán aquí"
                    />
                )}
            </Section>

            {/* More Albums */}
            {albums.length > 6 && (
                <Section
                    title="Más Álbumes"
                    linkTo="/app/library?tab=albums"
                    delay={400}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {albums.slice(6, 12).map((album, index) => (
                            <AlbumCard
                                key={album.id}
                                album={album}
                                index={index}
                                onPlay={handlePlayAlbum}
                                thumbnail={albumThumbnails.get(album.id)}
                            />
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}
