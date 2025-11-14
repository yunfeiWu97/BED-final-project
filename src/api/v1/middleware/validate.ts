import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema, ValidationOptions as JoiOptions } from "joi";
import { HTTP_STATUS } from "../../../constants/httpConstants";

/** Schemas for different request parts */
export interface RequestSchema {
  body?: ObjectSchema<any>;
  params?: ObjectSchema<any>;
  query?: ObjectSchema<any>;
}

/** Options controlling unknown key stripping per request part */
interface ValidationOptions {
  stripBody?: boolean;
  stripQuery?: boolean;
  stripParams?: boolean;
}

/**
 * Creates an Express middleware to validate selected parts of the request.
 *
 * Only the parts provided in `schemas` are validated. Unknown keys are allowed by
 * default (to avoid false positives) and values are converted (so strings like
 * "true"/"1" can be coerced to boolean/number when schema permits).
 *
 * On failure, responds with HTTP 400 including structured details.
 *
 * @param schemas - Joi schemas for body, params, and/or query
 * @param options - Stripping behavior for unknown keys (defaults: body/params strip, query keep)
 * @returns Middleware that validates and writes back the sanitized values
 */
export const validateRequest = (
  schemas: RequestSchema,
  options: ValidationOptions = {}
) => {
  const DEFAULT_STRIP_BODY = true;
  const DEFAULT_STRIP_PARAMS = true;
  const DEFAULT_STRIP_QUERY = false;

  const validatePart = (
    schema: ObjectSchema<any>,
    data: unknown,
    partName: "Body" | "Params" | "Query",
    shouldStrip: boolean
  ) => {
    // Allow unknown keys and convert values (e.g., "true" -> true) where possible.
    const joiOptions: JoiOptions = {
      abortEarly: false,
      allowUnknown: true,
      convert: true,
      stripUnknown: shouldStrip,
    };

    const { error, value } = schema.validate(data ?? {}, joiOptions);
    return { error, value };
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ part: string; message: string; path: string }> = [];

      if (schemas.body) {
        const { error, value } = validatePart(
          schemas.body,
          req.body,
          "Body",
          options.stripBody ?? DEFAULT_STRIP_BODY
        );
        if (error) {
          error.details.forEach(d =>
            errors.push({ part: "Body", message: d.message, path: d.path.join(".") })
          );
        } else {
          req.body = value;
        }
      }

      if (schemas.params) {
        const { error, value } = validatePart(
          schemas.params,
          req.params,
          "Params",
          options.stripParams ?? DEFAULT_STRIP_PARAMS
        );
        if (error) {
          error.details.forEach(d =>
            errors.push({ part: "Params", message: d.message, path: d.path.join(".") })
          );
        } else {
          req.params = value;
        }
      }

      if (schemas.query) {
        const { error, value } = validatePart(
          schemas.query,
          req.query,
          "Query",
          options.stripQuery ?? DEFAULT_STRIP_QUERY
        );
        if (error) {
          error.details.forEach(d =>
            errors.push({ part: "Query", message: d.message, path: d.path.join(".") })
          );
        } else {
          req.query = value;
        }
      }

      if (errors.length > 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: "error",
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: errors,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "error",
        error: {
          message: "Validation failure",
          code: "VALIDATION_EXCEPTION",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
};
