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
        schemas: {
          Employer: {
            type: "object",
            required: ["id", "ownerUserId", "name", "hourlyRate", "createdAt", "updatedAt"],
            properties: {
              id:           { type: "string", example: "emp_123" },
              ownerUserId:  { type: "string", example: "demo-user" },
              name:         { type: "string", example: "Guarana Restaurant" },
              hourlyRate:   { type: "number", example: 16.5 },
              createdAt:    { type: "string", format: "date-time", example: "2025-01-01T12:00:00Z" },
              updatedAt:    { type: "string", format: "date-time", example: "2025-01-01T12:10:00Z" },
            },
          },
          Shift: {
            type: "object",
            required: ["id", "ownerUserId", "employerId", "startTime", "endTime", "createdAt", "updatedAt"],
            properties: {
              id:            { type: "string", example: "shift_123" },
              ownerUserId:   { type: "string", example: "demo-user" },
              employerId:    { type: "string", example: "emp_123" },
              startTime:     { type: "string", format: "date-time", example: "2025-01-04T09:00:00Z" },
              endTime:       { type: "string", format: "date-time", example: "2025-01-04T17:00:00Z" },
              durationHours: { type: "number", example: 8 },
              tips:          { type: "number", example: 25 },
              createdAt:     { type: "string", format: "date-time" },
              updatedAt:     { type: "string", format: "date-time" },
            },
          },
          Adjustment: {
            type: "object",
            required: ["id", "ownerUserId", "date", "amount", "createdAt", "updatedAt"],
            properties: {
              id:           { type: "string", example: "adj_123" },
              ownerUserId:  { type: "string", example: "demo-user" },
              date:         { type: "string", format: "date", example: "2025-01-10" },
              amount:       { type: "number", example: -12.5 },
              employerId:   { type: "string", nullable: true, example: "emp_123" },
              shiftId:      { type: "string", nullable: true, example: "shift_123" },
              note:         { type: "string", example: "Uniform fee" },
              createdAt:    { type: "string", format: "date-time" },
              updatedAt:    { type: "string", format: "date-time" },
            },
          },
          ErrorResponse: {
            type: "object",
            properties: {
              status: { type: "string", example: "error" },
              error: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Unauthorized" },
                  code: { type: "string", example: "UNAUTHORIZED" },
                },
              },
              timestamp: { type: "string", format: "date-time" },
            },
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ["./src/api/v1/routes/*.ts", "./src/api/v1/validations/*.ts"],
  };

  return swaggerJsdoc(swaggerOptions);
};
