import { UserModel } from "../database/models";

export class UserRepository {
  async findByEmail(email: string): Promise<UserModel | null> {
    return UserModel.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserModel | null> {
    return UserModel.findByPk(id);
  }
}
