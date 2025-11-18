import Joi from "joi";
import { RequestSchema } from "../middleware/validate";

/**
 * Convert a human-readable datetime into an ISO-8601 string (UTC).
 *
 * Accepted examples:
 *  - "2025-11-14 21:00"
 *  - "2025/11/14 21:00"
 *  - Already ISO: "2025-11-14T21:00:00Z", "2025-11-14T21:00:00-06:00"
 *
 * Implementation notes:
 *  - Replace a single whitespace between date & time with 'T'
 *  - Allow '/' as date separator by normalizing to '-'
 *  - Fallback to the platform Date parser and normalize via toISOString()
 *
 * Validation errors use Joi's helpers so the error bubbles up as 400 with details.
 */
const humanToIso: Joi.CustomValidator = (value, helpers) => {
  if (typeof value !== "string") {
    return helpers.error("any.invalid", { message: "time must be a string" });
  }

  const raw = value.trim();
  const normalized = raw.includes("T")
    ? raw
    : raw.replace(/\//g, "-").replace(/\s+/, "T"); // "YYYY-MM-DD HH:mm" -> "YYYY-MM-DDTHH:mm"

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return helpers.error("any.invalid", {
      message:
        "time must look like 'YYYY-MM-DD HH:mm' (or a valid ISO-8601 string)",
    });
  }
  return parsed.toISOString();
};

/** Reusable time field that accepts human input and returns ISO string. */
const timeField = Joi.string()
  .required()
  .custom(humanToIso, "normalize human time → ISO")
  .messages({
    "any.required": "time is required",
    "any.invalid":
      "time must look like 'YYYY-MM-DD HH:mm' (or a valid ISO-8601 string)",
  });

/**
 * Validation schemas for Shift requests.
 * Times accept human-readable strings; validator normalizes them to ISO.
 * Service layer converts ISO to Date before persistence.
 */
export const shiftSchemas: Record<string, RequestSchema> = {
  // GET /api/v1/shifts?employerId=&includeTotals=
  listQuery: {
    query: Joi.object({
      employerId: Joi.string().trim().optional(),
      includeTotals: Joi.boolean()
        .truthy("true")
        .truthy("1")
        .falsy("false")
        .falsy("0")
        .default(false)
        .optional(),
    }).unknown(true),
  },

  // POST /api/v1/shifts
  create: {
    body: Joi.object({
      employerId: Joi.string().required().messages({
        "any.required": "Body.employerId is required",
        "string.empty": "Body.employerId cannot be empty",
      }),
      startTime: timeField.label("startTime"),
      endTime: timeField.label("endTime"),
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
      employerId: Joi.string().optional(),
      startTime: timeField.optional().label("startTime"),
      endTime: timeField.optional().label("endTime"),
      tips: Joi.number().min(0).optional().messages({
        "number.min": "Body.tips must be greater than or equal to 0",
      }),
    }).min(1),
  },

  // Common params
  paramsWithId: {
    params: Joi.object({
      id: Joi.string().required().messages({
        "any.required": "Params.id is required",
        "string.empty": "Params.id cannot be empty",
      }),
    }),
  },
};
