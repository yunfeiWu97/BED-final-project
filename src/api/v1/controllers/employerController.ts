import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { successResponse } from "../models/responseModel";
import * as employerService from "../services/employerService";

/**
* Resolve the current owner user identifier.
* For Milestone 1 we do not have authentication yet, so we read an optional
* "x-demo-user-id" header and fall back to "demo-user".
* @param request - The Express request.
*/
const resolveOwnerUserId = (request: Request): string =>
  (request.header("x-demo-user-id") as string) || "demo-user";

/**
 * Lists employers for the current user.
 * @param request - Express request
 * @param response - Express response
 * @param next - Express next function
 */
export const listEmployers = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const employers = await employerService.getAllEmployers(ownerUserId);
    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(employers, "Employers successfully retrieved"));
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Creates a new employer for the current user.
 * @param request - Express request
 * @param response - Express response
 * @param next - Express next function
 */
export const createEmployer = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const { name, hourlyRate } = request.body;

    const created = await employerService.createEmployer(ownerUserId, {
      name,
      hourlyRate,
    });

    response
      .status(HTTP_STATUS.CREATED)
      .json(successResponse(created, "Employer created successfully"));
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Gets a single employer by id for the current user.
 * @param request - Express request
 * @param response - Express response
 * @param next - Express next function
 */
export const getEmployer = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const { id } = request.params;

    const employer = await employerService.getEmployerById(ownerUserId, id);

    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(employer, "Employer retrieved successfully"));
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Updates an employer for the current user.
 * @param request - Express request
 * @param response - Express response
 * @param next - Express next function
 */
export const updateEmployer = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const { id } = request.params;
    const { name, hourlyRate } = request.body;

    const updated = await employerService.updateEmployer(ownerUserId, id, {
      name,
      hourlyRate,
    });

    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(updated, "Employer updated successfully"));
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Deletes an employer for the current user.
 * @param request - Express request
 * @param response - Express response
 * @param next - Express next function
 */
export const deleteEmployer = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const { id } = request.params;

    await employerService.deleteEmployer(ownerUserId, id);

    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(null, "Employer deleted successfully"));
  } catch (error: unknown) {
    next(error);
  }
};
