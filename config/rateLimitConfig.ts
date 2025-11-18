import rateLimit from "express-rate-limit";

/**
 * Write endpoints limiter
 * Purpose: prevent accidental rapid repeat submits (double-click, laggy retries).
 */
export const writeLimiter = rateLimit({
  windowMs: 10_000, // 10 seconds 
  limit: 3,         // 3 writes 
  standardHeaders: true,
  legacyHeaders: false,
  // Minimal, readable error body
  message: { message: "Too many requests. Please try again later." },
});
