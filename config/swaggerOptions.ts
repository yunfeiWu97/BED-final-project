import swaggerJsdoc, { Options } from "swagger-jsdoc";

/**
 * Build and return the OpenAPI/Swagger specification object.
 * - Reads the server url from environment variables.
 * - Declares bearer token security for later authentication.
 * - Scans route and validation files for @openapi JSDoc blocks.
 *
 * @returns An object that conforms to the OpenAPI specification.
 */
export const generateSwaggerSpec = (): object => {
  const serverUrl: string =
    process.env.SWAGGER_SERVER_URL || "http://localhost:3000/api/v1";

  const swaggerOptions: Options = {
    definition: {
      openapi: "3.1.0",
      info: {
        title: "Hourly Work Log API",
        version: "1.0.0",
        description:
          "API documentation for the Hourly Work Log application (Milestone 1).",
      },
      servers: [
        {
          url: serverUrl,
          description: process.env.NODE_ENV || "development",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ["./src/api/v1/routes/*.ts", "./src/api/v1/validations/*.ts"],
  };

  return swaggerJsdoc(swaggerOptions);
};
