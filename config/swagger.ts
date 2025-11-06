import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { generateSwaggerSpec } from "./swaggerOptions";

/**
 * Mount Swagger UI at /api-docs.
 * Generates the OpenAPI specification at startup and serves it with Swagger UI.
 *
 * @param app - The Express application instance.
 */
const setupSwagger = (app: Express): void => {
  const specs: object = generateSwaggerSpec();
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};

export default setupSwagger;
