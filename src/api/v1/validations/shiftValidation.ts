import Joi from "joi";
import { RequestSchema } from "../middleware/validate";

/**
 * Validation schemas for Shift requests.
 * Times are accepted as ISO strings; service layer converts them to Date.
 */
export const shiftSchemas: Record<string, RequestSchema> = {
  // GET /api/v1/shifts?employerId=&includeTotals=
  listQuery: {
    query: Joi.object({
      employerId: Joi.string().optional().messages({
        "string.base": "Query.employerId must be a string",
      }),
      includeTotals: Joi.string().valid("true", "false").optional().messages({
        "any.only": 'Query.includeTotals must be "true" or "false"',
      }),
    }),
  },

  // POST /api/v1/shifts
  create: {
    body: Joi.object({
      employerId: Joi.string().required().messages({
        "any.required": "Body.employerId is required",
        "string.empty": "Body.employerId cannot be empty",
      }),
      startTime: Joi.date().iso().required().messages({
        "any.required": "Body.startTime is required",
      }),
      endTime: Joi.date().iso().required().messages({
        "any.required": "Body.endTime is required",
      }),
      tips: Joi.number().min(0).optional().messages({
        "number.min": "Body.tips must be greater than or equal to 0",
      }),
    }),
  },

  // PUT /api/v1/shifts/:id
  update: {
    params: Joi.object({
      id: Joi.string().required().messages({
        "any.required": "Params.id is required",
        "string.empty": "Params.id cannot be empty",
      }),
    }),
    body: Joi.object({
      employerId: Joi.string().optional().messages({
        "string.empty": "Body.employerId cannot be empty",
      }),
      startTime: Joi.date().iso().optional(),
      endTime: Joi.date().iso().optional(),
      tips: Joi.number().min(0).optional().messages({
        "number.min": "Body.tips must be greater than or equal to 0",
      }),
    }),
  },

  // Common params for /api/v1/shifts/:id
  paramsWithId: {
    params: Joi.object({
      id: Joi.string().required().messages({
        "any.required": "Params.id is required",
        "string.empty": "Params.id cannot be empty",
      }),
    }),
  },
};
