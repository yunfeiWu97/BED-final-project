import express from "express";

const app = express();
app.use(express.json());

/**
 * Health check endpoint.
 * @route GET /api/v1/health
 * @returns 200 OK with a standard response envelope
 */
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "success", message: "OK", data: null });
});

export default app;
