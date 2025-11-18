import Joi from "joi";
import { RequestSchema } from "../middleware/validate";

/**
 * @openapi
 * tags:
 *   - name: Adjustments
 *     description: Manage pay adjustments linked to shifts or employers
 * components:
 *   schemas:
 *     Adjustment:
 *       type: object
 *       required:
 *         - id
 *         - ownerUserId
 *         - date
 *         - amount
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           example: "adj_123"
 *         ownerUserId:
 *           type: string
 *           example: "demo-user"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-01-04T00:00:00Z"
 *         amount:
 *           type: number
 *           example: 25.5
 *         employerId:
 *           type: string
 *           nullable: true
 *           example: "emp_123"
 *         shiftId:
 *           type: string
 *           nullable: true
 *           example: "shift_456"
 *         note:
 *           type: string
 *           maxLength: 200
 *           nullable: true
 *           example: "Tips top-up for busy Friday night"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-04T01:02:03Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-04T02:03:04Z"
 */

/**
 * Adjustment validation schemas organized by request type.
 * - create: POST /api/v1/adjustments
 * - update: PUT /api/v1/adjustments/:id
 * - paramsWithId: routes that only need :id params validation
 */
export const adjustmentSchemas: Record<string, RequestSchema> = {
  // POST /api/v1/adjustments
  create: {
    body: Joi.object({
      date: Joi.date().iso().required().messages({
        "any.required": "Body.date is required",
      }),
      amount: Joi.number().required().messages({
        "any.required": "Body.amount is required",
        "number.base": "Body.amount must be a number",
      }),
      employerId: Joi.string().optional(),
      shiftId: Joi.string().optional(),
      note: Joi.string().max(200).optional(),
    })
      .or("employerId", "shiftId")
      .messages({
        "object.missing":
          "Provide at least one of employerId or shiftId for creation",
      }),
  },

  // PUT /api/v1/adjustments/:id
  update: {
    params: Joi.object({
      id: Joi.string().required().messages({
        "any.required": "Params.id is required",
        "string.empty": "Params.id cannot be empty",
      }),
    }),
    body: Joi.object({
      date: Joi.date().iso().optional(),
      amount: Joi.number().optional().messages({
        "number.base": "Body.amount must be a number",
      }),
      employerId: Joi.string().optional(),
      shiftId: Joi.string().optional(),
      note: Joi.string().max(200).optional(),
    }),
  },

  // Common params for /api/v1/adjustments/:id
  paramsWithId: {
    params: Joi.object({
      id: Joi.string().required().messages({
        "any.required": "Params.id is required",
        "string.empty": "Params.id cannot be empty",
      }),
    }),
  },
};
