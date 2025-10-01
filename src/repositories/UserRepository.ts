import { type User, userSchema } from "../model/User.ts";
import { InsertUser, usersTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { db } from "../db/db.ts";

export default class UserRepository {
  async findAll(): Promise<User[]> {
    return await db.select().from(usersTable);
  }

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

  async delete(id: number): Promise<boolean> {
    const rs = await db.delete(usersTable).where(eq(usersTable.id, id))
      .returning();
    return rs.length != 0;
  }
}
