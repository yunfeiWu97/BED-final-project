import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { successResponse } from "../models/responseModel";
import * as shiftService from "../services/shiftService";

/**
 * Resolve the current owner user identifier.
 * For Milestone 1 we do not have authentication yet, so we read an optional
 * "x-demo-user-id" header and fall back to "demo-user".
 * @param request - The Express request object.
 * @returns The resolved user id to filter user-owned data.
 */
const resolveOwnerUserId = (request: Request): string =>
  (request.header("x-demo-user-id") as string) || "demo-user";

/**
 * Parse any query value into a boolean.
 * Accepts: true/false (boolean), "true"/"false", "1"/"0", ["true"], etc.
 * @param raw - The raw query value from Express (ParsedQs-compatible).
 * @returns A boolean result; defaults to false for unsupported inputs.
 */
function parseBooleanQuery(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return parseBooleanQuery(raw[raw.length - 1]);
  }
  return false;
}

/**
 * GET /api/v1/shifts
 * List shifts for the current user.
 *
 * Query parameters:
 * - employerId?: string      Filter by employer id.
 * - includeTotals?: boolean  When true, include {hours, pay} grouped by day and month.
 *
 * Response:
 * - items: Shift[] each enriched with {hours, pay}
 * - totals?: { byDay: { [YYYY-MM-DD]: {hours, pay} }, byMonth: { [YYYY-MM]: {hours, pay} } }
 */
export const getAllShifts = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const employerId: string | undefined =
      typeof request.query.employerId === "string"
        ? request.query.employerId
        : undefined;

    const includeTotals: boolean = parseBooleanQuery(
      request.query.includeTotals
    );

    const result = await shiftService.getAllShifts(ownerUserId, {
      employerId,
      includeTotals,
    });

    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(result, "Shifts successfully retrieved"));
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * POST /api/v1/shifts
 * Create a new shift for the current user.
 *
 * Body:
 * - employerId: string
 * - startTime: string (human-friendly OR ISO; normalized by validator to ISO)
 * - endTime:   string (human-friendly OR ISO; normalized by validator to ISO)
 * - tips?: number
 */
export const createShift = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const created = await shiftService.createShift(ownerUserId, {
      employerId: request.body.employerId,
      startTime: request.body.startTime,
      endTime: request.body.endTime,
      tips: request.body.tips,
    });

    response
      .status(HTTP_STATUS.CREATED)
      .json(successResponse(created, "Shift created successfully"));
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * GET /api/v1/shifts/:id
 * Retrieve a single shift by identifier for the current user.
 */
export const getShiftById = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const shiftId: string = request.params.id;

    const shift = await shiftService.getShiftById(ownerUserId, shiftId);
    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(shift, "Shift successfully retrieved"));
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * PUT /api/v1/shifts/:id
 * Update an existing shift (only provided fields will be changed).
 *
 * Body (any subset):
 * - employerId?: string
 * - startTime?: string (human-friendly OR ISO; normalized by validator to ISO)
 * - endTime?: string   (human-friendly OR ISO; normalized by validator to ISO)
 * - tips?: number
 */
export const updateShift = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const shiftId: string = request.params.id;

    const updated = await shiftService.updateShift(ownerUserId, shiftId, {
      employerId: request.body.employerId,
      startTime: request.body.startTime,
      endTime: request.body.endTime,
      tips: request.body.tips,
    });

    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(updated, "Shift updated successfully"));
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * DELETE /api/v1/shifts/:id
 * Delete a shift that belongs to the current user.
 */
export const deleteShift = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId: string = resolveOwnerUserId(request);
    const shiftId: string = request.params.id;

    await shiftService.deleteShift(ownerUserId, shiftId);
    response
      .status(HTTP_STATUS.OK)
      .json(successResponse(null, "Shift deleted successfully"));
  } catch (error: unknown) {
    next(error);
  }
};
