/**
 * @file Unit tests for the authorize middleware.
 * The tests verify allow and forbid behaviors based on roles in response.locals.
 */

import { authorize } from "../../src/api/v1/middleware/authorize";
import { HTTP_STATUS } from "../../src/constants/httpConstants";

/** Create a minimal mock response object with locals, status, and json. */
function createMockResponse(
  initialLocals?: Record<string, unknown>
): any {
  const locals: Record<string, unknown> = { ...(initialLocals || {}) };
  const status = jest.fn().mockReturnThis();
  const json = jest.fn().mockReturnThis();
  return { locals, status, json } as any;
}

function createMockRequest(): any {
  return {} as any;
}

describe("authorize middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("allows when roles include the required role", () => {
    // Arrange
    const request = createMockRequest();
    const response = createMockResponse({ uid: "u1", roles: ["user"] });
    const next = jest.fn();
    const authorizeMiddleware = authorize({ hasRole: ["user"] });

    // Act
    authorizeMiddleware(request, response, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });

  test("forbids when roles do not include the required role", () => {
    // Arrange
    const request = createMockRequest();
    const response = createMockResponse({ uid: "u1", roles: ["guest"] });
    const next = jest.fn();
    const authorizeMiddleware = authorize({ hasRole: ["user"] });

    // Act
    authorizeMiddleware(request, response, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
    const payload = response.json.mock.calls[0][0];
    expect(payload?.status).toBe("error");
    expect(payload?.error?.code).toBe("FORBIDDEN");
  });

  test("allows when authenticated but roles are missing (default basic user)", () => {
    // Arrange
    const request = createMockRequest();
    const response = createMockResponse({ uid: "u1" }); // no roles
    const next = jest.fn();
    const authorizeMiddleware = authorize({ hasRole: ["user"] });

    // Act
    authorizeMiddleware(request, response, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
  });
  
  // cover 401 when uid is missing
  test("responds 401 when uid is missing", () => {
    // Arrange
    const request = createMockRequest();
    const response = createMockResponse(); // no uid
    const next = jest.fn();
    const authorizeMiddleware = authorize({ hasRole: ["user"] });

    // Act
    authorizeMiddleware(request, response, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    const payload = response.json.mock.calls[0][0];
    expect(payload?.status).toBe("error");
    expect(payload?.error?.code).toBe("UNAUTHORIZED");
  });

  test("responds 401 when roles exist but uid is missing", () => {
    // Arrange
    const request = createMockRequest();
    const response = createMockResponse({ roles: ["user"] }); // roles set, but no uid
    const next = jest.fn();
    const authorizeMiddleware = authorize({ hasRole: ["user"] });

    // Act
    authorizeMiddleware(request, response, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
  });
});
