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
    album: 5,
    track: 10
} as const;

const TRACK_ARTIST_BOOST = 1.5;
const TRACK_ALBUM_BOOST = 1.2;
const ALBUM_ARTIST_BOOST = 1.1;
const ARTIST_TRACK_BOOST = 0.8;
const RELATED_LIMIT = 3;

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
            addScore(artistScores, artist.id, artist, baseScore);
        });

        albumsRaw.forEach((album) => {
            const baseScore = computeTextScore(album.name, normalizedQuery, tokens);
            addScore(albumScores, album.id, album, baseScore);
        });

        tracksRaw.forEach((track) => {
            const baseScore = computeTextScore(track.name, normalizedQuery, tokens);
            addScore(trackScores, track.id, track, baseScore);
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
}

function computeTextScore(value: string, normalizedQuery: string, tokens: string[]): number {
    const target = value.toLowerCase();
    let score = 0;

    if (target === normalizedQuery) {
        score += 6;
    } else if (target.startsWith(normalizedQuery)) {
        score += 4;
    }

    if (target.includes(normalizedQuery)) {
        score += 2;
    }

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
