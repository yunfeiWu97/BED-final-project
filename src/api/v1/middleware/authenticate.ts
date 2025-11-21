import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { auth } from "../../../../config/firebaseConfig";

/**
 * Extract the raw bearer token from the Authorization header.
 *
 * Accepted format: "Bearer <token>" (case-insensitive for the scheme).
 *
 * @param request - The incoming Express request.
 * @returns The token string when present and well-formed; otherwise undefined.
 */
function getBearerToken(request: Request): string | undefined {
  const header = request.header("Authorization") || request.header("authorization");
  if (!header) return undefined;

  const parts = header.split(" ");
  if (parts.length !== 2) return undefined;

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return undefined;

  return token?.trim() || undefined;
}

/**
 * Authentication middleware that verifies a Firebase ID token.
 *
 * Behavior:
 * - When the Authorization header is missing or malformed, respond with 401.
 * - When token verification fails, respond with 401.
 * - When token verification succeeds, store the user identifier in `res.locals.uid`
 *   and call `next()`.
 *
 * Response on failure matches the project’s error envelope:
 * {
 *   status: "error",
 *   error: { message: string, code: string },
 *   timestamp: string
 * }
 *
 * This middleware does not decide authorization. It only authenticates and
 * exposes the user identifier for downstream handlers.
 *
 * @param request - The Express request.
 * @param response - The Express response.
 * @param next - The next middleware function.
 */
export async function authenticate(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getBearerToken(request);
    if (!token) {
      response.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: "error",
        error: {
          message: "Missing or invalid Authorization header.",
          code: "UNAUTHORIZED",
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const decoded = await auth.verifyIdToken(token);
    // Expose the authenticated user identifier for later use.
    response.locals.uid = decoded.uid;
    
    const rawRoles = decoded?.roles;
    if (Array.isArray(rawRoles)) {
      response.locals.roles = rawRoles;
    } else if (typeof rawRoles === "string") {
      response.locals.roles = [rawRoles];
    }

    next();
  } catch {
    response.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: "error",
      error: {
        message: "Authentication failed. Please provide a valid token.",
        code: "UNAUTHORIZED",
      },
      timestamp: new Date().toISOString(),
    });
  }
}
