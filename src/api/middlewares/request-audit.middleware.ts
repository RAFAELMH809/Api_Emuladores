import type { NextFunction, Request, Response } from "express";
import { ApiRequestLogRepository } from "../../infrastructure/repositories/api-request-log.repository";
import { logger } from "../../shared/config/logger";

const repository = new ApiRequestLogRepository();

export function requestAuditMiddleware(req: Request, res: Response, next: NextFunction): void {
  const receivedAt = new Date();

  res.on("finish", () => {
    const respondedAt = new Date();
    const durationMs = Math.max(0, respondedAt.getTime() - receivedAt.getTime());

    void repository
      .create({
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        receivedAt,
        respondedAt,
        durationMs,
        ip: req.ip,
        userAgent: req.get("user-agent") ?? null
      })
      .catch((error: unknown) => {
        logger.error("Failed to persist API request audit", error);
      });
  });

  next();
}
