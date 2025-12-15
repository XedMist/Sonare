import { PrismaClient, Capability } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding lyrics permissions...");

    const permissions = [
        { capability: Capability.READ, resource: "lyrics" },
        { capability: Capability.CREATE, resource: "lyrics" },
        { capability: Capability.UPDATE, resource: "lyrics" },
        { capability: Capability.DELETE, resource: "lyrics" },
    ];

    const createdPermissions = [];

    for (const p of permissions) {
        // Upsert permission
        // Since there's no unique constraint on capability+resource in the schema (only ID),
        // we should check if it exists first to avoid duplicates.
        // Prisma schema: model Permision { ... } (typo in schema)
        
        let permission = await prisma.permision.findFirst({
            where: {
                capability: p.capability,
                resource: p.resource,
            }
        });

        if (!permission) {
            permission = await prisma.permision.create({
                data: {
                    capability: p.capability,
                    resource: p.resource,
                }
            });
            console.log(`Created permission: ${p.capability} ${p.resource}`);
        } else {
            console.log(`Permission already exists: ${p.capability} ${p.resource}`);
        }
        createdPermissions.push(permission);
    }

    // Assign to Roles
    const rolesToUpdate = [
        { name: "ADMIN", capabilities: [Capability.READ, Capability.CREATE, Capability.UPDATE, Capability.DELETE] },
        { name: "USER", capabilities: [Capability.READ] },
        { name: "ARTIST", capabilities: [Capability.READ] }, 
    ];

    for (const roleConfig of rolesToUpdate) {
        const role = await prisma.role.findUnique({
            where: { name: roleConfig.name }
        });

        if (role) {
            // Filter permissions for this role
            const rolePermissions = createdPermissions.filter(p => roleConfig.capabilities.includes(p.capability));
            
            // Connect permissions
            await prisma.role.update({
                where: { id: role.id },
                data: {
                    permisions: {
                        connect: rolePermissions.map(p => ({ id: p.id }))
                    }
                }
            });
            console.log(`Updated role ${roleConfig.name} with ${rolePermissions.length} lyrics permissions.`);
        } else {
            console.warn(`Role ${roleConfig.name} not found!`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
