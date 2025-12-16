import { db } from "@/db/db.ts";
import { PrismaMapper } from "@/model/mappers.ts";
import type { Album, Artist, Track } from "@/model/entity/index.ts";
import type {
    Artist as PrismaArtist,
    Album as PrismaAlbum,
    Track as PrismaTrack
} from "@/generated/prisma/client.ts";

export interface SearchResult {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
    relatedTracks: Record<string, Track[]>;
}

// Nested partial types for unified search
interface PartialArtist {
    id: string;
    name: string;
}

interface PartialAlbum {
    id: string;
    name: string;
    artistID: string;
}

// Album with optional partial artist info
type AlbumWithPartialArtist = Omit<Album, 'artist'> & { artist?: PartialArtist };

// Track with optional partial album info
type TrackWithPartialAlbum = Omit<Track, 'album'> & { album?: PartialAlbum };

// Unified result item with type and score for combined display
export interface UnifiedSearchItem {
    type: 'artist' | 'album' | 'track';
    id: string;
    name: string;
    score: number;
    artist?: Artist;
    album?: AlbumWithPartialArtist;
    track?: TrackWithPartialAlbum;
}

export interface UnifiedSearchResult {
    items: UnifiedSearchItem[];
    relatedTracks: Record<string, Track[]>;
}

type Ranked<T extends { name: string }> = {
    entity: T;
    name: string;
    score: number;
};

type TrackWithRelations = PrismaTrack & {
    artist: PrismaArtist | null;
    album: PrismaAlbum | null;
};

type AlbumWithArtist = PrismaAlbum & {
    artist: PrismaArtist | null;
};

const LIMITS = {
    artist: 5,
    album: 8,
    track: 15,
    artistRelatedTracks: 5,
    artistRelatedAlbums: 3,
    albumRelatedTracks: 5
} as const;

const TRACK_ARTIST_BOOST = 1.5;
const TRACK_ALBUM_BOOST = 1.2;
const ALBUM_ARTIST_BOOST = 1.1;
const ARTIST_TRACK_BOOST = 0.8;
const RELATED_LIMIT = 3;

// Popularity boost factor (0-100 popularity translates to 0-2 score boost)
const POPULARITY_BOOST_FACTOR = 0.02;

// Boost for items directly related to a matched item (additive)
const ARTIST_CONTENT_BOOST = 2.0;
const ALBUM_CONTENT_BOOST = 4.0;  // Tracks from a matched album
const TRACK_RELATED_BOOST = 6.0;  // Album/artist of a matched track

// Type priority boost - items that directly match should rank highest
const ARTIST_DIRECT_MATCH_BOOST = 10.0;
const ALBUM_DIRECT_MATCH_BOOST = 12.0;
const TRACK_DIRECT_MATCH_BOOST = 14.0;

export default class SearchService {
    async search(query: string, types: string[] = ["artist", "album", "track"]): Promise<SearchResult> {
        const normalizedQuery = query.trim().toLowerCase();
        const requestedTypes = new Set(types.map((type) => type.toLowerCase()));
        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

        if (!normalizedQuery) {
            return { artists: [], albums: [], tracks: [], relatedTracks: {} };
        }

        const [artistsRaw, albumsRaw, tracksRaw] = await Promise.all([
            db.artist.findMany({
                where: { name: { contains: query, mode: "insensitive" } },
                take: LIMITS.artist * 3,
            }),
            db.album.findMany({
                where: { name: { contains: query, mode: "insensitive" } },
                take: LIMITS.album * 3,
                include: { artist: true },
            }),
            db.track.findMany({
                where: { name: { contains: query, mode: "insensitive" } },
                take: LIMITS.track * 3,
                include: { artist: true, album: true },
            }),
        ]);

        const artistScores = new Map<string, Ranked<PrismaArtist>>();
        const albumScores = new Map<string, Ranked<AlbumWithArtist>>();
        const trackScores = new Map<string, Ranked<TrackWithRelations>>();

        artistsRaw.forEach((artist) => {
            const baseScore = computeTextScore(artist.name, normalizedQuery, tokens);
            const popularityBoost = (artist.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
            const directMatchBoost = baseScore > 0 ? ARTIST_DIRECT_MATCH_BOOST : 0;
            addScore(artistScores, artist.id, artist, baseScore + popularityBoost + directMatchBoost);
        });

        albumsRaw.forEach((album) => {
            const baseScore = computeTextScore(album.name, normalizedQuery, tokens);
            const popularityBoost = (album.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
            addScore(albumScores, album.id, album, baseScore + popularityBoost);
        });

        tracksRaw.forEach((track) => {
            const baseScore = computeTextScore(track.name, normalizedQuery, tokens);
            const popularityBoost = (track.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
            addScore(trackScores, track.id, track, baseScore + popularityBoost);
        });

        // Relation boosts: track -> album/artist
        trackScores.forEach((ranked) => {
            if (ranked.score <= 0) return;
            const track = ranked.entity;
            if (track.artist) {
                addScore(artistScores, track.artist.id, track.artist, ranked.score * TRACK_ARTIST_BOOST);
            }
            if (track.album) {
                addScore(albumScores, track.album.id, track.album, ranked.score * TRACK_ALBUM_BOOST);
            }
        });

        // Relation boosts: album -> artist
        albumScores.forEach((ranked) => {
            if (ranked.score <= 0) return;
            const album = ranked.entity;
            if (album.artist) {
                addScore(artistScores, album.artist.id, album.artist, ranked.score * ALBUM_ARTIST_BOOST);
            }
        });

        // Fetch related content for matched artists (popular tracks and albums)
        const matchedArtistIds = Array.from(artistScores.keys());
        if (matchedArtistIds.length > 0) {
            const [artistTracks, artistAlbums] = await Promise.all([
                db.track.findMany({
                    where: { artistID: { in: matchedArtistIds } },
                    orderBy: { popularity: 'desc' },
                    take: LIMITS.artistRelatedTracks * matchedArtistIds.length,
                    include: { artist: true, album: true },
                }),
                db.album.findMany({
                    where: { artistID: { in: matchedArtistIds } },
                    orderBy: { popularity: 'desc' },
                    take: LIMITS.artistRelatedAlbums * matchedArtistIds.length,
                    include: { artist: true },
                }),
            ]);

            // Add artist's popular tracks with additive boost
            artistTracks.forEach((track) => {
                const artistRanked = artistScores.get(track.artistID || '');
                if (artistRanked) {
                    const popularityBoost = (track.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
                    addScore(trackScores, track.id, track, ARTIST_CONTENT_BOOST + popularityBoost);
                }
            });

            // Add artist's albums with additive boost
            artistAlbums.forEach((album) => {
                const artistRanked = artistScores.get(album.artistID || '');
                if (artistRanked) {
                    const popularityBoost = (album.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
                    addScore(albumScores, album.id, album, ARTIST_CONTENT_BOOST + popularityBoost);
                }
            });
        }

        // Relation boosts: artist -> tracks (surface popular songs for artist queries)
        artistScores.forEach((ranked) => {
            if (ranked.score <= 0) return;
            const artistId = ranked.entity.id;
            tracksRaw
                .filter((track) => track.artistID === artistId)
                .forEach((track) => addScore(trackScores, track.id, track, ranked.score * ARTIST_TRACK_BOOST));
        });

        const artistsRanked = selectRanked(artistScores, LIMITS.artist);
        const albumsRanked = selectRanked(albumScores, LIMITS.album);
        const tracksRanked = requestedTypes.has("track") ? selectRanked(trackScores, LIMITS.track) : [];

        const relatedTracks = requestedTypes.has("track")
            ? await buildRelatedTracks(tracksRanked)
            : {};

        const artists: Artist[] = requestedTypes.has("artist")
            ? artistsRanked.map((ranked) => PrismaMapper.toArtist(ranked.entity))
            : [];
        const albums: Album[] = requestedTypes.has("album")
            ? albumsRanked.map((ranked) => PrismaMapper.toAlbum(ranked.entity))
            : [];
        const tracks: Track[] = requestedTypes.has("track")
            ? tracksRanked.map((ranked) => PrismaMapper.toTrack(ranked.entity))
            : [];

        return { artists, albums, tracks, relatedTracks };
    }

    // New unified search that returns all results in a single sorted list
    async searchUnified(query: string): Promise<UnifiedSearchResult> {
        const normalizedQuery = query.trim().toLowerCase();
        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

        if (!normalizedQuery) {
            return { items: [], relatedTracks: {} };
        }

        const [artistsRaw, albumsRaw, tracksRaw] = await Promise.all([
            db.artist.findMany({
                where: { name: { contains: query, mode: "insensitive" } },
                take: LIMITS.artist * 3,
            }),
            db.album.findMany({
                where: { name: { contains: query, mode: "insensitive" } },
                take: LIMITS.album * 3,
                include: { artist: true },
            }),
            db.track.findMany({
                where: { name: { contains: query, mode: "insensitive" } },
                take: LIMITS.track * 3,
                include: { artist: true, album: true },
            }),
        ]);

        const artistScores = new Map<string, Ranked<PrismaArtist>>();
        const albumScores = new Map<string, Ranked<AlbumWithArtist>>();
        const trackScores = new Map<string, Ranked<TrackWithRelations>>();

        // Score artists - add direct match boost for artists that match the query
        artistsRaw.forEach((artist) => {
            const baseScore = computeTextScore(artist.name, normalizedQuery, tokens);
            const popularityBoost = (artist.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
            // Artists get an extra boost when they directly match the query
            const directMatchBoost = baseScore > 0 ? ARTIST_DIRECT_MATCH_BOOST : 0;
            addScore(artistScores, artist.id, artist, baseScore + popularityBoost + directMatchBoost);
        });

        // Score albums - add direct match boost
        albumsRaw.forEach((album) => {
            const baseScore = computeTextScore(album.name, normalizedQuery, tokens);
            const popularityBoost = (album.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
            const directMatchBoost = baseScore > 0 ? ALBUM_DIRECT_MATCH_BOOST : 0;
            addScore(albumScores, album.id, album, baseScore + popularityBoost + directMatchBoost);
        });

        // Score tracks - add direct match boost
        tracksRaw.forEach((track) => {
            const baseScore = computeTextScore(track.name, normalizedQuery, tokens);
            const popularityBoost = (track.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
            const directMatchBoost = baseScore > 0 ? TRACK_DIRECT_MATCH_BOOST : 0;
            addScore(trackScores, track.id, track, baseScore + popularityBoost + directMatchBoost);
        });

        // For matched tracks: boost their album and artist
        tracksRaw.forEach((track) => {
            const ranked = trackScores.get(track.id);
            if (ranked && ranked.score > 0) {
                // Boost the track's album
                if (track.album) {
                    addScore(albumScores, track.album.id, track.album as AlbumWithArtist, TRACK_RELATED_BOOST);
                }
                // Boost the track's artist
                if (track.artist) {
                    addScore(artistScores, track.artist.id, track.artist, TRACK_RELATED_BOOST);
                }
            }
        });

        // For matched albums: fetch popular tracks and boost their artist
        const matchedAlbumIds = Array.from(albumScores.keys());
        if (matchedAlbumIds.length > 0) {
            const albumTracks = await db.track.findMany({
                where: { albumID: { in: matchedAlbumIds } },
                orderBy: { popularity: 'desc' },
                take: LIMITS.albumRelatedTracks * matchedAlbumIds.length,
                include: { artist: true, album: true },
            });

            albumTracks.forEach((track) => {
                const albumRanked = albumScores.get(track.albumID || '');
                if (albumRanked && albumRanked.score >= TRACK_RELATED_BOOST) {
                    // Boost tracks if the album was a direct match OR if a track from it matched
                    const popularityBoost = (track.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
                    addScore(trackScores, track.id, track, ALBUM_CONTENT_BOOST + popularityBoost);
                }
            });

            // Boost artists of matched albums
            albumsRaw.forEach((album) => {
                const albumRanked = albumScores.get(album.id);
                if (albumRanked && albumRanked.score > ALBUM_DIRECT_MATCH_BOOST && album.artist) {
                    addScore(artistScores, album.artist.id, album.artist, ALBUM_CONTENT_BOOST);
                }
            });
        }

        // Fetch related content for matched artists
        const matchedArtistIds = Array.from(artistScores.keys());
        if (matchedArtistIds.length > 0) {
            const [artistTracks, artistAlbums] = await Promise.all([
                db.track.findMany({
                    where: { artistID: { in: matchedArtistIds } },
                    orderBy: { popularity: 'desc' },
                    take: LIMITS.artistRelatedTracks * matchedArtistIds.length,
                    include: { artist: true, album: true },
                }),
                db.album.findMany({
                    where: { artistID: { in: matchedArtistIds } },
                    orderBy: { popularity: 'desc' },
                    take: LIMITS.artistRelatedAlbums * matchedArtistIds.length,
                    include: { artist: true },
                }),
            ]);

            artistTracks.forEach((track) => {
                const artistRanked = artistScores.get(track.artistID || '');
                if (artistRanked && artistRanked.score > ARTIST_DIRECT_MATCH_BOOST) {
                    // Only boost if artist was a direct match (not just related)
                    const popularityBoost = (track.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
                    addScore(trackScores, track.id, track, ARTIST_CONTENT_BOOST + popularityBoost);
                }
            });

            artistAlbums.forEach((album) => {
                const artistRanked = artistScores.get(album.artistID || '');
                if (artistRanked && artistRanked.score > ARTIST_DIRECT_MATCH_BOOST) {
                    // Only boost if artist was a direct match
                    const popularityBoost = (album.popularity ?? 0) * POPULARITY_BOOST_FACTOR;
                    addScore(albumScores, album.id, album, ARTIST_CONTENT_BOOST + popularityBoost);
                }
            });
        }

        // Get ranked results
        const artistsRanked = selectRanked(artistScores, LIMITS.artist);
        const albumsRanked = selectRanked(albumScores, LIMITS.album);
        const tracksRanked = selectRanked(trackScores, LIMITS.track);

        // Build unified list with scores for sorting
        const unifiedItems: UnifiedSearchItem[] = [];

        artistsRanked.forEach((ranked) => {
            unifiedItems.push({
                type: 'artist',
                id: ranked.entity.id,
                name: ranked.entity.name,
                score: ranked.score,
                artist: PrismaMapper.toArtist(ranked.entity),
            });
        });

        albumsRanked.forEach((ranked) => {
            const album = PrismaMapper.toAlbum(ranked.entity);
            unifiedItems.push({
                type: 'album',
                id: ranked.entity.id,
                name: ranked.entity.name,
                score: ranked.score,
                album: {
                    ...album,
                    artist: ranked.entity.artist ? {
                        id: ranked.entity.artist.id,
                        name: ranked.entity.artist.name,
                    } : undefined,
                },
            });
        });

        tracksRanked.forEach((ranked) => {
            const track = PrismaMapper.toTrack(ranked.entity);
            unifiedItems.push({
                type: 'track',
                id: ranked.entity.id,
                name: ranked.entity.name,
                score: ranked.score,
                track: {
                    ...track,
                    album: ranked.entity.album ? {
                        id: ranked.entity.album.id,
                        name: ranked.entity.album.name,
                        artistID: ranked.entity.album.artistID,
                    } : undefined,
                },
            });
        });

        // Sort all items by score descending
        unifiedItems.sort((a, b) => b.score - a.score);

        // Build related tracks
        const relatedTracks = await buildRelatedTracks(tracksRanked);

        return { items: unifiedItems, relatedTracks };
    }
}

function computeTextScore(value: string, normalizedQuery: string, tokens: string[]): number {
    const target = value.toLowerCase();
    let score = 0;

    // Exact match gets highest score
    if (target === normalizedQuery) {
        score += 15;
    } else if (target.startsWith(normalizedQuery)) {
        score += 8;
    } else if (target.includes(normalizedQuery)) {
        score += 4;
    }

    // Token matching for partial matches
    tokens.forEach((token) => {
        if (token.length > 2 && target.includes(token)) {
            score += 1;
        }
    });

    return score;
}

function addScore<T extends { id: string; name: string }>(
    map: Map<string, Ranked<T>>,
    id: string,
    entity: T,
    delta: number,
) {
    if (delta <= 0) return;
    const existing = map.get(id);
    if (existing) {
        existing.score += delta;
    } else {
        map.set(id, { entity, score: delta, name: entity.name.toLowerCase() });
    }
}

function selectRanked<T extends { name: string }>(map: Map<string, Ranked<T>>, limit: number): Ranked<T>[] {
    return Array.from(map.values())
        .sort((a, b) => (b.score === a.score ? a.name.localeCompare(b.name) : b.score - a.score))
        .slice(0, limit);
}

async function buildRelatedTracks(selected: Ranked<TrackWithRelations>[]): Promise<Record<string, Track[]>> {
    if (!selected.length) return {};

    const related: Record<string, Track[]> = {};
    const albumIds = new Set<string>();
    const artistFallbackIds = new Set<string>();
    const selectedIds = selected.map(({ entity }) => entity.id);

    selected.forEach(({ entity }) => {
        if (entity.albumID) {
            albumIds.add(entity.albumID);
        } else if (entity.artistID) {
            artistFallbackIds.add(entity.artistID);
        }
    });

    const albumIdArray = Array.from(albumIds);
    const artistIdArray = Array.from(artistFallbackIds);

    const [albumRelatedRaw, artistRelatedRaw] = await Promise.all([
        albumIdArray.length
            ? db.track.findMany({
                where: {
                    albumID: { in: albumIdArray },
                    NOT: { id: { in: selectedIds } },
                },
                orderBy: {
                    popularity: 'desc'
                },
                take: RELATED_LIMIT * albumIdArray.length,
                include: { artist: true, album: true },
            })
            : Promise.resolve([] as TrackWithRelations[]),
        artistIdArray.length
            ? db.track.findMany({
                where: {
                    artistID: { in: artistIdArray },
                    NOT: { id: { in: selectedIds } },
                },
                orderBy: {
                    popularity: 'desc'
                },
                take: RELATED_LIMIT * artistIdArray.length,
                include: { artist: true, album: true },
            })
            : Promise.resolve([] as TrackWithRelations[]),
    ]);

    const albumBuckets = new Map<string, Track[]>();
    albumRelatedRaw.forEach((track) => {
        if (!track.albumID) return;
        const bucket = albumBuckets.get(track.albumID) ?? [];
        if (bucket.length < RELATED_LIMIT) {
            bucket.push(PrismaMapper.toTrack(track));
            albumBuckets.set(track.albumID, bucket);
        }
    });

    const artistBuckets = new Map<string, Track[]>();
    artistRelatedRaw.forEach((track) => {
        if (!track.artistID) return;
        const bucket = artistBuckets.get(track.artistID) ?? [];
        if (bucket.length < RELATED_LIMIT) {
            bucket.push(PrismaMapper.toTrack(track));
            artistBuckets.set(track.artistID, bucket);
        }
    });

    selected.forEach(({ entity }) => {
        if (entity.albumID && albumBuckets.has(entity.albumID)) {
            related[entity.id] = albumBuckets.get(entity.albumID)!;
        } else if (!entity.albumID && entity.artistID && artistBuckets.has(entity.artistID)) {
            related[entity.id] = artistBuckets.get(entity.artistID)!;
        } else {
            related[entity.id] = [];
        }
    });

    return related;
}
