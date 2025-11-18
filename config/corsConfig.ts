import { CorsOptions } from "cors";

/**
 * Build CORS options based on environment.
 * Dev: allow all for easy testing; Prod: restrict to ALLOWED_ORIGINS.
 */
export const getCorsConfig = (): CorsOptions => {
  const isDevelopment: boolean = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // allow all origins in development for easy testing
    return {
      origin: true,
      credentials: true,
    } as CorsOptions;
  }

  // Be stricter outside development
  return {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  } as CorsOptions;
};
