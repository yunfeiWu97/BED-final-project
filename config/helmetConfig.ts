import { HelmetOptions } from "helmet";

/**
 * Build Helmet options based on environment.
 * In development we disable HSTS; in production we enable stronger headers.
 */
export const getHelmetConfig = (): HelmetOptions => {
  const isDevelopment: boolean = process.env.NODE_ENV === "development";

  const baseConfig: HelmetOptions = {
    // API docs/Swagger often inject inline scripts; disable CSP here.
    contentSecurityPolicy: false,
    // Always prevent MIME sniffing
    noSniff: true,
  };

  if (isDevelopment) {
    return {
      ...baseConfig,
      // No HTTPS enforcement in development
      hsts: false,
    } as HelmetOptions;
  }

  // Production gets full security
  return {
    ...baseConfig,
    hsts: {
      // one year in seconds
      maxAge: 3153600,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "no-referrer" },
  } as HelmetOptions;
};
