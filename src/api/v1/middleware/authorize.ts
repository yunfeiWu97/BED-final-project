import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";

/**
 * Authorization middleware that enforces role requirements.
 *
 * For Milestone 3 context:
 * - The only required role is "user".
 * - If no roles are present but the request is authenticated (uid exists),
 *   we treat the caller as a basic "user" to reduce setup complexity.
 *
 * @param options - Options that specify required roles.
 * @param options.hasRole - A list of roles that are accepted for this route.
 * @returns An Express middleware that permits or denies based on roles.
 */
export function authorize(
  options: { hasRole: string[] }
): (request: Request, response: Response, next: NextFunction) => void {
  const requiredRoles = Array.isArray(options?.hasRole) ? options.hasRole : [];

  return (request: Request, response: Response, next: NextFunction): void => {
    try {
      const uid = response.locals?.uid as string | undefined;
      const rolesFromLocals = response.locals?.roles as unknown;
      
      if (!uid) {
        response.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: "error",
          error: {
            message: "Missing or invalid bearer token",
            code: "UNAUTHORIZED",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      // Default behavior for this project: if authenticated but no roles,
      // treat as a basic "user".
      const effectiveRoles: string[] = Array.isArray(rolesFromLocals)
        ? (rolesFromLocals as string[])
        : uid
        ? ["user"]
        : [];

      const isAllowed: boolean =
        requiredRoles.length === 0
          ? true
          : requiredRoles.some((requiredRole: string) =>
              effectiveRoles.includes(requiredRole)
            );

      if (!isAllowed) {
        response.status(HTTP_STATUS.FORBIDDEN).json({
          status: "error",
          error: {
            message: "Forbidden. Required role is missing.",
            code: "FORBIDDEN",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch {
      response.status(HTTP_STATUS.FORBIDDEN).json({
        status: "error",
        error: { message: "Forbidden", code: "FORBIDDEN" },
        timestamp: new Date().toISOString(),
      });
    }
  };
}
