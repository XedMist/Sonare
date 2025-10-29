import { db } from "../db/db.ts";
import type { User } from "../generated/prisma/client.d.ts";

export default class UserRepository {
<<<<<<< HEAD
    /*async findAll(): Promise<User[]> {
        return await db.select().from(usersTable);
    }
||||||| 4691fd2
    async findAll(): Promise<User[]> {
        return await db.select().from(usersTable);
    }
=======
  async findAll(): Promise<User[]> {
    return await db.select().from(usersTable);
  }
>>>>>>> main

  async insert(u: Omit<User, "id">): Promise<User> {
    const newUser: InsertUser = { name: u.name };
    const user = await db.insert(usersTable).values(newUser).returning();
    return userSchema.parse(user[0]);
  }

  async findById(id: number): Promise<User | null> {
    const user = await db.select().from(usersTable).where(
      eq(usersTable.id, id),
    );

    return user.length == 0 ? null : userSchema.parse(user[0]);
  }

<<<<<<< HEAD
    async delete(id: number): Promise<boolean> {
        const rs = await db.delete(usersTable).where(eq(usersTable.id, id))
            .returning();
        return rs.length != 0;
    }*/
||||||| 4691fd2
    async delete(id: number): Promise<boolean> {
        const rs = await db.delete(usersTable).where(eq(usersTable.id, id))
            .returning();
        return rs.length != 0;
    }
=======
  async delete(id: number): Promise<boolean> {
    const rs = await db.delete(usersTable).where(eq(usersTable.id, id))
      .returning();
    return rs.length != 0;
  }
>>>>>>> main
}
