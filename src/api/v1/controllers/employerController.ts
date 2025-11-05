import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { successResponse } from "../models/responseModel";
import * as employerService from "../services/employerService";

/**
 * Retrieves a list of employers.
 * Currently returns an empty array as a placeholder.
 *
 * @param request - Express request object.
 * @param response - Express response object.
 * @param next - Express next function for error propagation.
 * @returns Sends a 200 OK response with a standardized success envelope.
 */
export const getAllEmployers = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employers = await employerService.getAllEmployers();
    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(employers, "Employers successfully retrieved"));
  } catch (error: unknown) {
    next(error as Error);
  }
};