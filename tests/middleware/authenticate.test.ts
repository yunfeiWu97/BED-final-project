/**
 * @file Unit tests for the authenticate middleware.
 * The Firebase Admin dependency is mocked so no real verification occurs.
 */

import { authenticate } from "../../src/api/v1/middleware/authenticate";
import { HTTP_STATUS } from "../../src/constants/httpConstants";

// Mock Firebase Admin auth
const verifyIdToken = jest.fn();

jest.mock("../../config/firebaseConfig", () => {
  return {
    auth: { verifyIdToken },
  };
});

function createMockResponse() {
  const locals: Record<string, unknown> = {};
  const status = jest.fn().mockReturnThis();
  const json = jest.fn().mockReturnThis();
  return {
    locals,
    status,
    json,
  } as any;
}

function createMockRequest(headers?: Record<string, string>) {
  const store = Object.fromEntries(
    Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), v])
  );
  return {
    header: (name: string) => store[name.toLowerCase()],
  } as any;
}

describe("authenticate middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("responds 401 when Authorization header is missing", async () => {
    // Arrange
    const request = createMockRequest();
    const response = createMockResponse();
    const next = jest.fn();

    // Act
    await authenticate(request, response, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    const payload = response.json.mock.calls[0][0];
    expect(payload?.status).toBe("error");
    expect(payload?.error?.code).toBe("UNAUTHORIZED");
  });

  test("responds 401 when Authorization header is malformed", async () => {
    // Arrange
    const request = createMockRequest({ Authorization: "Token abc" });
    const response = createMockResponse();
    const next = jest.fn();

    // Act
    await authenticate(request, response, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
  });

  test("calls next and sets res.locals.uid when token is valid", async () => {
    // Arrange
    const request = createMockRequest({ Authorization: "Bearer valid-token" });
    const response = createMockResponse();
    const next = jest.fn();
    verifyIdToken.mockResolvedValueOnce({ uid: "user-123" });

    // Act
    await authenticate(request, response, next);

    // Assert
    expect(verifyIdToken).toHaveBeenCalledWith("valid-token");
    expect(response.locals.uid).toBe("user-123");
    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });

  test("responds 401 when token verification fails", async () => {
    // Arrange
    const request = createMockRequest({ Authorization: "Bearer bad-token" });
    const response = createMockResponse();
    const next = jest.fn();
    verifyIdToken.mockRejectedValueOnce(new Error("invalid"));

    // Act
    await authenticate(request, response, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
  });
});
