import RoleRepository from "@/repositories/RoleRepository.ts";
import UserRepository from "@/repositories/UserRepository.ts";
import type { User } from '@/model/entity/index.ts'
import { ConflictError, InternalServerError } from "@/error/ApiError.ts";


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

        return this.userRepository.create(name, password, role.id);
    }
}
