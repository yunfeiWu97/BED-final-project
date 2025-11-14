/**
 * Rate limit configuration for write operations (POST/PUT/DELETE).
 *
 * - Uses the client IP as the key (supports proxies via X-Forwarded-For).
 * - Returns a structured error payload consistent with the app's error envelope.
 * - Exports a factory plus a ready-to-use limiter for convenience.
 */

import rateLimit from "express-rate-limit";
import type { Request } from "express";

/** Public config you can override when creating a limiter. */
export interface WriteRateLimitConfig {
  /** Time window in milliseconds (default: 15 minutes). */
  windowMs: number;
  /** Max allowed requests per window per client (default: 100). */
  max: number;
}

const DEFAULTS: WriteRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 write ops per window per client
};

/**
 * Build a rate limiter middleware for write endpoints.
 *
 * @param overrides - Optional overrides for `windowMs` and `max`
 * @returns An Express middleware that enforces rate limiting
 */
export function makeWriteRateLimiter(
  overrides?: Partial<WriteRateLimitConfig>
) {
  const merged: WriteRateLimitConfig = { ...DEFAULTS, ...(overrides ?? {}) };

  // Align the options type with the library (v7) without requiring every property.
  const options: Parameters<typeof rateLimit>[0] = {
    windowMs: merged.windowMs,
    limit: merged.max,
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,

    /**
     * Always return a string key (client IP).
     * Prioritizes X-Forwarded-For, then req.ip, then socket address.
     */
    keyGenerator: (req: Request): string => {
      const xff = req.headers["x-forwarded-for"];
      const firstForwarded =
        (Array.isArray(xff) ? xff[0] : xff)?.split(",")[0]?.trim();

      return (
        firstForwarded ??
        req.ip ??
        req.socket?.remoteAddress ??
        "unknown-client"
      );
    },

    /**
     * Structured JSON error consistent with the app's error envelope.
     */
    message: {
      status: "error",
      error: {
        message:
          "Too many requests. Please try again later.",
        code: "RATE_LIMITED",
      },
      timestamp: new Date().toISOString(),
    },
  };

  return rateLimit(options);
}

/** Ready-to-use write limiter with default settings. */
export const writeLimiter = makeWriteRateLimiter();
