import { Router } from "express";
import { AuthController } from "../../controllers/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { loginSchema } from "../../dtos/auth.dto";

const controller = new AuthController();
export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), (req, res, next) => {
  controller.login(req, res).catch(next);
});

authRouter.get("/me", authMiddleware, (req, res, next) => {
  controller.me(req, res).catch(next);
});
