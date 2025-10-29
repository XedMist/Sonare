import UserRepository from "../repositories/UserRepository.ts";
import type { User } from "../model/User.ts";

export default class UserService {
    repo = new UserRepository();
}
