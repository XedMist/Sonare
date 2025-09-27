import type { User } from "../model/User.ts";

// Si fuera de verdad se deberia llamar a la base de datos
// Para la prueba se utiliza un mapa
let nextId = 1;
const store = new Map<number, User>();

export default class UserRepository {
  // No hace falta el async pero lo dejo para imitar a como se
  // haria con una base de datos real
  async findAll(): Promise<User[]> {
    return Array.from(store.values());
  }

  async insert(u: Omit<User, "id">): Promise<User> {
    const user: User = { id: nextId++, ...u };
    store.set(user.id, user);
    return user;
  }
}
