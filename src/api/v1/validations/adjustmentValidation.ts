import Joi from "joi";
import { RequestSchema } from "../middleware/validate";

/**
 * Validation schemas for Adjustment requests.
 * Creation requires at least one of employerId or shiftId.
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
