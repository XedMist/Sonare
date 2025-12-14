import type { Playlist } from "@/model/entity";
import PlaylistService from "@/services/PlaylistService";
import { createMiddleware } from "hono/factory";
import { ForbiddenError, InternalServerError, NotFoundError } from '@/error/ApiError';

// La idea de las guardias es la de proteger los recursos para que solo los
// creadores puedan modificarlos
export interface ResourceGuard<T> {
    findByID(id: string): Promise<T | null>;
    getOwnerID(resource: T): string;
}

export const requireOwner = <T>(guard: ResourceGuard<T>, param: string = "id") => {
    return createMiddleware(async (c, next) => {
        const resourceID = c.req.param(param)
        if (resourceID === undefined) {
            throw new InternalServerError()
        }

        const userID = c.get("userId") as string
        const role = c.get("userRole") as string

        const resource = await guard.findByID(resourceID)

        if (!resource) {
            throw new NotFoundError(`Playlist with ID ${resourceID} not found`)
        }

        if (role === "ADMIN")
            return next();

        if (guard.getOwnerID(resource) !== userID) {
            throw new ForbiddenError(`You are not the resource owner of ${resource}`)
        }

        c.set("resource", resource);
        await next();

    })
}


export class PlaylistGuard implements ResourceGuard<Playlist> {
    private service = new PlaylistService();

    findByID(id: string) {
        return this.service.findByID(id);
    }

    getOwnerID(playlist: Playlist) {
        return playlist.userID;
    }
}
