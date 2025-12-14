import { db } from "../db/db.ts";
import type { Permission, User, Role } from "../model/entity/index.ts";
import { PrismaMapper } from "../model/mappers.ts";

import { hash } from 'bcrypt'

interface CreateUserInput {
    name: string;
    password: string;
    roleID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    bio?: string | null;
    country?: string | null;
    birthdate?: Date | null;
}

interface UpdateProfileInput {
    displayName?: string;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    country?: string | null;
    birthdate?: Date | null;
}

export default class UserRepository {
    async findByUsername(name: string): Promise<User | null> {
        const user = await db.user.findUnique({ where: { name } });
        return user ? PrismaMapper.toUser(user) : null;
    }

    async findByIdWithPermissions(id: string): Promise<User & { role: Role & { permissions: Permission[] } } | null> {
        const user = await db.user.findUnique({
            where: { id },
            include: { role: { include: { permisions: true } } }
        });

        if (!user) return null;

        return {
            ...PrismaMapper.toUser(user),
            role: {
                ...PrismaMapper.toRole(user.role),
                permissions: user.role.permisions.map(PrismaMapper.toPermission)
            }
        };
    }

    async create(data: CreateUserInput): Promise<User> {
        const hashedPassword = await hash(data.password, 10);
        const user = await db.user.create({
            data: {
                name: data.name,
                password: hashedPassword,
                roleID: data.roleID,
                displayName: data.displayName,
                firstName: data.firstName,
                lastName: data.lastName,
                bio: data.bio ?? null,
                country: data.country ?? null,
                birthdate: data.birthdate ?? null,
            }
        });
        return PrismaMapper.toUser(user);
    }

    async updateProfile(id: string, data: UpdateProfileInput): Promise<User> {
        const user = await db.user.update({
            where: { id },
            data,
        });
        return PrismaMapper.toUser(user);
    }

    async updateAvatar(id: string, avatarObjectKey: string | null): Promise<User> {
        const user = await db.user.update({
            where: { id },
            data: { avatarObjectKey },
        });
        return PrismaMapper.toUser(user);
    }
}
