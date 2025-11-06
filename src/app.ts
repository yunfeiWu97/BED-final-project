import express, { Express } from "express";
import errorHandler from "./api/v1/middleware/errorHandler";
import { HTTP_STATUS } from "./constants/httpConstants";

import employerRoutes from "./api/v1/routes/employerRoutes";
import shiftRoutes from "./api/v1/routes/shiftRoutes";
import adjustmentRoutes from "./api/v1/routes/adjustmentRoutes";

/**
 * Express application instance.
 */
const app: Express = express();

/**
 * Interface for server health response.
 */
interface HealthCheckResponse {
  status: string;
  uptime: number;
  timestamp: string;
  version: string;
}

// -------- Middleware  --------
app.use(express.json());

// -------- Routes --------

/**
 * Root endpoint for a quick sanity check.
 * @route GET /
 * @returns Plain text greeting.
 */
app.get("/", (_request, response) => {
  response.status(HTTP_STATUS.OK).send("Hello World");
});

/**
 * Health check endpoint that returns server status information.
 * @route GET /api/v1/health
 * @returns JSON response with server health metrics.
 */
app.get("/api/v1/health", (_request, response) => {
  const healthData: HealthCheckResponse = {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };
  response.status(HTTP_STATUS.OK).json(healthData);
});

/**
 * Employers resource routes.
 * All endpoints under /api/v1/employers.
 */
app.use("/api/v1/employers", employerRoutes);

/**
 * Shifts resource routes.
 * All endpoints under /api/v1/shifts.
 */
app.use("/api/v1/shifts", shiftRoutes);

/**
 * Adjustments resource routes.
 * All endpoints under /api/v1/adjustments.
 */
app.use("/api/v1/adjustments", adjustmentRoutes);

// -------- Error handling needs to be used last --------
app.use(errorHandler);

export default app;
