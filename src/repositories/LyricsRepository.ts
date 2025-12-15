import { db } from "../db/db.ts"
import { PrismaMapper } from "../model/mappers.ts";
import type { Lyrics } from "../model/entity/index.ts";

export default class LyricsRepository {
    async findByTrackID(trackID: string): Promise<Lyrics | null> {
        const lyrics = await db.lyrics.findUnique({
            where: {
                trackID: trackID,
            }
        });
        return lyrics ? PrismaMapper.toLyrics(lyrics) : null;
    }

    async findById(id: string): Promise<Lyrics | null> {
        const lyrics = await db.lyrics.findUnique({
            where: {
                id: id,
            }
        });
        return lyrics ? PrismaMapper.toLyrics(lyrics) : null;
    }

    async create(data : { trackID: string, syncedLyrics?: string | null}): Promise<Lyrics> {
        const created = await db.lyrics.create({
            data: {
                trackID: data.trackID,
                syncedLyrics: data.syncedLyrics,
            }
        });
        return PrismaMapper.toLyrics(created);
    }

    async update(id: string, data : { syncedLyrics?: string | null}): Promise<Lyrics | null> {
        try {
            const updated = await db.lyrics.update({
                where: { id },
                data: {
                    syncedLyrics: data.syncedLyrics,
                }
            });
            return PrismaMapper.toLyrics(updated);
        } catch (_) {
            return null;
        }
    }

    async deleteLyrics(id: string): Promise<boolean> {
        try {
            await db.lyrics.delete({
                where: { id },
            });
            return true;
        } catch (_) {
            return false;
        }
    }
}