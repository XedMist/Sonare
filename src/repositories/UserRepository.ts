import { db } from "../db/db.ts";
import type { Permission, User, Role } from "../model/entity/index.ts";
import { PrismaMapper } from "../model/mappers.ts";

import { hash } from 'bcrypt'

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

    async create(name: string, password: string, roleID: string): Promise<User> {
        const hashedPassword = await hash(password, 10);
        const user = await db.user.create({
            data: {
                name: name,
                password: hashedPassword,
                roleID: roleID
            }
        });
        return PrismaMapper.toUser(user);
    }
}
