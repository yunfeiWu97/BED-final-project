import Joi from "joi";
import { RequestSchema } from "../middleware/validate";

/**
 * @openapi
 * tags:
 *   - name: Employers
 *     description: Manage employers
 * components:
 *   schemas:
 *     Employer:
 *       type: object
 *       required: [id, ownerUserId, name, hourlyRate, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: string
 *           example: "emp_123"
 *         ownerUserId:
 *           type: string
 *           example: "demo-user"
 *         name:
 *           type: string
 *           example: "Guarana Restaurant"
 *         hourlyRate:
 *           type: number
 *           example: 16.5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T12:00:00Z"
 */
/**
 * Employer validation schemas organized by request type (demo-aligned).
 * - create: POST /api/v1/employers
 * - update: PUT /api/v1/employers/:id
 * - paramsWithId: routes that only need :id params validation
 */
const name = Joi.string().trim().min(1).max(80).messages({
  "string.empty": "Name cannot be empty",
  "string.min": "Name must be at least 1 character",
  "string.max": "Name must be at most 80 characters",
});
const hourlyRate = Joi.number().positive().precision(2).messages({
  "number.positive": "Hourly rate must be positive",
});

export const employerSchemas: Record<string, RequestSchema> = {
  // POST /api/v1/employers
  create: {
    body: Joi.object({
      name: name.required(),
      hourlyRate: hourlyRate.required(),
    }),
  },

  // PUT /api/v1/employers/:id
  update: {
    params: Joi.object({
      id: Joi.string().trim().required().messages({
        "any.required": "Employer ID is required",
        "string.empty": "Employer ID cannot be empty",
      }),
    }),
    body: Joi.object({
      name,
      hourlyRate,
    }).min(1), // at least one field to update
  },

  // For GET/DELETE /api/v1/employers/:id
  paramsWithId: {
    params: Joi.object({
      id: Joi.string().trim().required().messages({
        "any.required": "Employer ID is required",
        "string.empty": "Employer ID cannot be empty",
      }),
    }),
  },
};
