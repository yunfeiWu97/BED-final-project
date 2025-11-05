import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { successResponse } from "../models/responseModel";

/**
 * Retrieves a list of adjustments.
 * Currently returns an empty array as a placeholder.
 *
 * @param request - Express request object.
 * @param response - Express response object.
 * @param next - Express next function for error propagation.
 * @returns Sends a 200 OK response with a standardized success envelope.
 */
export const getAllAdjustments = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adjustments: Array<unknown> = [];
    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(adjustments, "Adjustments successfully retrieved"));
  } catch (error: unknown) {
    next(error as Error);
  }
};
