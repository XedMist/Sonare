import type { Artist } from "../generated/prisma/index.d.ts";
import ArtistRepository from "../repositories/ArtistRepository.ts";

export default class ArtistService {
    repo = new ArtistRepository();

    async findAll(): Promise<Artist[]> {
        return await this.repo.findAll();
    }

    async create(payload: Omit<Artist, "id">): Promise<void> {
        await this.repo.insert(payload);
    }

    async findById(id: Pick<Artist, "id">): Promise<Artist | null> {
        return await this.repo.findById(id);
    }

    async delete(id: Pick<Artist, "id">): Promise<void> {
        await this.repo.delete(id);
    }

}
