/**
 * @file Integration test: write endpoints should return 403 when role is missing.
 */
import request from "supertest";
import app from "../../src/app";

// Mock Firebase verifyIdToken to simulate an authenticated user with a non-user role.
jest.mock("../../config/firebaseConfig", () => ({
  auth: { verifyIdToken: jest.fn().mockResolvedValue({ uid: "u-guest", roles: ["guest"] }) },
}));

describe("authorization forbidden for write endpoints", () => {
  const AUTH = { Authorization: "Bearer any-token" };

  test("POST /api/v1/employers -> 403 when role is not user", async () => {
    const res = await request(app)
      .post("/api/v1/employers")
      .set(AUTH)
      .send({ name: "X", hourlyRate: 10 });
    expect(res.status).toBe(403);
    expect(res.body?.status).toBe("error");
  });

  test("PUT /api/v1/shifts/:id -> 403 when role is not user", async () => {
    const res = await request(app)
      .put("/api/v1/shifts/any")
      .set(AUTH)
      .send({ tips: 0 });
    expect(res.status).toBe(403);
  });

  test("DELETE /api/v1/adjustments/:id -> 403 when role is not user", async () => {
    const res = await request(app)
      .delete("/api/v1/adjustments/any")
      .set(AUTH);
    expect(res.status).toBe(403);
  });
});
