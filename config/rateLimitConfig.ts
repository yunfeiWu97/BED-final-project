import rateLimit from "express-rate-limit";
import type { Request } from "express";

/**
 * Build a stable client key for rate limiting.
 *
 * Precedence:
 *  1) First IP in the X-Forwarded-For header (when behind a proxy and `app.set("trust proxy", 1)` is enabled)
 *  2) `request.ip` as computed by Express
 *  3) `request.socket.remoteAddress` from the underlying connection
 *  4) Fallback to the literal string "unknown"
 *
 * This implementation guarantees a `string` return type to satisfy TypeScript,
 * even when some sources are `undefined` in Express v5 typings.
 *
 * @param request - The incoming Express Request.
 * @returns A non-empty string key identifying the client for rate limiting.
 */
export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.get("x-forwarded-for"); // string | undefined
  if (typeof forwarded === "string" && forwarded.length > 0) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const candidate =
    request.ip || request.socket?.remoteAddress || "";

  return candidate !== "" ? String(candidate) : "unknown";
}

/**
 * A rate limiter instance created once at module load.
 */
export const writeLimiter = rateLimit({
  windowMs: 10_000, // 10 seconds window
  limit: 3,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: clientKeyFromRequest,

  message: {
    status: "error",
    error: {
      message: "Too many requests. Please retry later.",
      code: "RATE_LIMITED",
    },
    timestamp: new Date().toISOString(),
  },
});
