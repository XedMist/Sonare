import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/driver";

const databaseUrl = Deno.env.get("DATABASE_FILE_NAME") || "file:local.db";
const client = createClient({ url: databaseUrl });
export const db = drizzle(client);
