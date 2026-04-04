import bcrypt from "bcryptjs";
import { AppError } from "../../shared/errors/app-error";
import { signToken } from "../../shared/security/jwt";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import type { LoginInput } from "../../domain/types/auth.types";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(input: LoginInput): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = signToken({ sub: user.id, role: user.role, email: user.email });
    return { accessToken };
  }

  async me(userId: string): Promise<{ id: string; email: string; fullName: string; role: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
  }
}
