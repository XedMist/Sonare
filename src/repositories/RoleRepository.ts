import { db } from '@/db/db.ts'
import type { Role, Permission } from '../model/entity/index.ts'
import { PrismaMapper } from '../model/mappers.ts'

export default class RoleRepository {
    async findByName(name: string): Promise<Role | null> {
        const role = await db.role.findUnique({
            where: { name }
        });
        return role ? PrismaMapper.toRole(role) : null;
    }

    async findByIdWithPermissions(id: string): Promise<Role & { permissions: Permission[] } | null> {
        const role = await db.role.findUnique({
            where: { id },
            include: { permisions: true }
        });
        
        if (!role) return null;
        
        return {
            ...PrismaMapper.toRole(role),
            permissions: role.permisions.map(PrismaMapper.toPermission)
        };
    }

    async create(name: string): Promise<Role> {
        const role = await db.role.create({
            data: {
                name: name
            }
        });
        return PrismaMapper.toRole(role);
    }
}
