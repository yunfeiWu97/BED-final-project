import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

/**
 * A rate limiter instance is created only once when the module is loaded.
 */
export const writeLimiter = rateLimit({
  // 1-minute window
  windowMs: 60_000,
  limit: 20,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request) => ipKeyGenerator(req as any),

  message: {
    status: "error",
    error: {
      message: "Too many requests. Please retry later.",
      code: "RATE_LIMITED",
    },
    timestamp: new Date().toISOString(),
  },
});
