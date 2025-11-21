import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { successResponse } from "../models/responseModel";
import * as employerService from "../services/employerService";

/**
 * Resolve the current authenticated user identifier from response locals.
 * This value is set by the authenticate middleware when a valid token is provided.
 * @param response - The Express response object.
 * @returns The authenticated user identifier as a string.
 */
const resolveOwnerUserId = (response: Response): string => {
  return String(response.locals.uid);
};

/**
 * Lists employers for the current user.
 * @param request - Express request.
 * @param response - Express response.
 * @param next - Express next function.
 */
export const listEmployers = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(response);
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
 * @param request - Express request.
 * @param response - Express response.
 * @param next - Express next function.
 */
export const createEmployer = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(response);
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
 * Gets a single employer by identifier for the current user.
 * @param request - Express request.
 * @param response - Express response.
 * @param next - Express next function.
 */
export const getEmployer = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(response);
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
 * @param request - Express request.
 * @param response - Express response.
 * @param next - Express next function.
 */
export const updateEmployer = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(response);
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
 * @param request - Express request.
 * @param response - Express response.
 * @param next - Express next function.
 */
export const deleteEmployer = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(response);
    const { id } = request.params;

    await employerService.deleteEmployer(ownerUserId, id);

    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(null, "Employer deleted successfully"));
  } catch (error: unknown) {
    next(error);
  }
};
