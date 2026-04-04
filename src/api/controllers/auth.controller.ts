import type { Request, Response } from "express";
import { container } from "../../application/container";
import { AppError } from "../../shared/errors/app-error";

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const result = await container.authService.login(req.body);
    res.status(200).json(result);
  }

  async me(req: Request, res: Response): Promise<void> {
    if (!req.auth) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    const result = await container.authService.me(req.auth.sub);
    res.status(200).json(result);
  }
}

