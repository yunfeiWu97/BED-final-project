import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { successResponse } from "../models/responseModel";

/**
 * Controller for Employers resource.
 * Provides handlers for employer-related HTTP requests.
 */
export class EmployerController {
  /**
   * Handles listing employers.
   * Currently returns an empty array as a placeholder.
   *
   * @param request - Express request object.
   * @param response - Express response object.
   * @returns Sends a 200 OK response with a standardized success envelope.
   */
  public static listEmployers(request: Request, response: Response): void {
    const employers: Array<unknown> = [];
    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(employers, "Employers list (placeholder)"));
  }
}
