import UserRepository from "../repositories/UserRepository.ts";
import type { User } from "../model/User.ts";

export default class UserService {
  repo = new UserRepository();

  async findAll(): Promise<User[]> {
    return await this.repo.findAll();
  }

  // El omit es para no tener que pasar el id al crear el usuario
  // De eso se encarga el repo
  async create(payload: Omit<User, "id">): Promise<User> {
    return await this.repo.insert(payload);
  }

  async findById(id: number): Promise<User | null> {
    return await this.repo.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    return this.repo.delete(id);
  }
}
