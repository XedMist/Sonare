import RoleRepository from "@/repositories/RoleRepository.ts";
import UserRepository from "@/repositories/UserRepository.ts";
import type { User } from '@/model/entity/index.ts'
import { ConflictError, InternalServerError } from "@/error/ApiError.ts";
import { db } from "@/db/db";
import { PrismaMapper } from "@/model/dto";


const USER_ROLE = "USER"

export default class UserService {
    private userRepository = new UserRepository();
    private roleRepository = new RoleRepository();

    async create(name: string, password: string): Promise<User> {
        const existing = await this.userRepository.findByUsername(name)
        if (existing) {
            throw new ConflictError("El usuario ya existe")
        }

        const role = await this.roleRepository.findByName(USER_ROLE)
        if (!role) {
            throw new InternalServerError(`No se encuentra el rol ${USER_ROLE}`)
        }

        const user = await db.$transaction(async (tx) => {
            const newUser = await this.userRepository.create(name, password, role.id);

            const favoritosPlaylist = await tx.playlist.create({
                data: {
                    name: "Favoritos",
                    userID: newUser.id
                }
            });

            const updatedUser = await tx.user.update({
                where: { id: newUser.id },
                data: { favoritosID: favoritosPlaylist.id }
            });

            return updatedUser;
        });

        return PrismaMapper.toUser(user);
    }
}
