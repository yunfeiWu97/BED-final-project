/**
 * @file Integration-style test that asserts all resource routes require authentication.
 * When the Authorization header is missing, the server must respond with HTTP 401.
 */
import request from "supertest";
import app from "../../src/app";

describe("authentication required on resource routes", () => {
  test("GET /api/v1/employers responds 401 without Authorization header", async () => {
    const response = await request(app).get("/api/v1/employers");
    expect(response.status).toBe(401);
    expect(response.body?.status).toBe("error");
  });

  test("POST /api/v1/shifts responds 401 without Authorization header", async () => {
    const response = await request(app).post("/api/v1/shifts").send({
      employerId: "emp_x",
      startTime: "2025-01-01 09:00",
      endTime: "2025-01-01 17:00",
    });
    expect(response.status).toBe(401);
    expect(response.body?.status).toBe("error");
  });

  test("DELETE /api/v1/adjustments/:id responds 401 without Authorization header", async () => {
    const response = await request(app).delete("/api/v1/adjustments/any");
    expect(response.status).toBe(401);
    expect(response.body?.status).toBe("error");
  });
});
