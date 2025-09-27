import UserRepository from "../repositories/UserRepository.ts";
import type { User } from "../model/User.ts";

export default class UserService {
  repo = new UserRepository();

  async findAll(): Promise<User[]> {
    return this.repo.findAll();
  }

  // El omit es para no tener que pasar el id al crear el usuario
  // De eso se encarga el repo
  async create(payload: Omit<User, "id">): Promise<User> {
    return this.repo.insert(payload);
  }
}
