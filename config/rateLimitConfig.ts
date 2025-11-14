import rateLimit, {
  ipKeyGenerator as ipKeyGeneratorFromLibrary,
} from "express-rate-limit";
import type { Request } from "express";

/**
 * Safely call express-rate-limit's ipKeyGenerator with Express v5 Request type.
 * The upstream helper is typed for Express v4, so we do a narrow cast here.
 *
 * @param request - The incoming Express Request.
 * @returns A client key derived from the request's IP address that is safe for IPv6.
 */
function internetProtocolV6SafeKeyGenerator(request: Request): string {
  const generator = ipKeyGeneratorFromLibrary as unknown as (
    request: Request
  ) => string;
  return generator(request);
}

/**
 * Build a rate limiter middleware for write endpoints (POST/PUT/DELETE).
 *
 * @param overrides - Optional windowMs, max, and statusCode overrides.
 * @returns An Express middleware that enforces write rate limits.
 */
export function writeLimiter(
  overrides?: Partial<{
    windowMs: number;
    max: number;
    statusCode: number;
  }>
) {
  const merged = {
    windowMs: overrides?.windowMs ?? 60_000, // 1 minute
    max: overrides?.max ?? 20, // 20 write requests per window
    statusCode: overrides?.statusCode ?? 429,
  };

  return rateLimit({
    windowMs: merged.windowMs,
    limit: merged.max,
    statusCode: merged.statusCode,

    keyGenerator: internetProtocolV6SafeKeyGenerator,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      status: "error",
      error: {
        message: "Too many requests. Please retry later.",
        code: "RATE_LIMITED",
      },
      timestamp: new Date().toISOString(),
    },
  });
}
