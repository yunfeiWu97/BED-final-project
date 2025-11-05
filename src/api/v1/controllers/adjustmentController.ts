import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { successResponse } from "../models/responseModel";
import * as adjustmentService from "../services/adjustmentService";

/**
 * Temporary helper to obtain the current owner user identifier.
 * Replace with Authentication middleware later (e.g., res.locals.uid).
 */
const resolveOwnerUserId = (request: Request): string =>
  (request.header("x-demo-user-id") as string) || "demo-user";

/**
 * GET /api/v1/adjustments
 * Returns all adjustments for the current user.
 * Supports optional filters: ?employerId=... & ?shiftId=...
 */
export const getAllAdjustments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId = getOwnerUserId(req);
    const employerId =
      typeof req.query.employerId === "string" ? req.query.employerId : undefined;
    const shiftId =
      typeof req.query.shiftId === "string" ? req.query.shiftId : undefined;

    const items = await adjustmentService.getAllAdjustments(ownerUserId, {
      employerId,
      shiftId,
    });

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(items, "Adjustments successfully retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/adjustments/:id
 * Returns a single adjustment by identifier for the current user.
 */
export const getAdjustmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId = getOwnerUserId(req);
    const { id } = req.params;

    const item = await adjustmentService.getAdjustmentById(ownerUserId, id);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(item, "Adjustment successfully retrieved"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/adjustments
 * Creates a new adjustment for the current user.
 */
export const createAdjustment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId = getOwnerUserId(req);
    const { date, amount, employerId, shiftId, note } = req.body;

    const created = await adjustmentService.createAdjustment(ownerUserId, {
      date,
      amount,
      employerId,
      shiftId,
      note,
    });

    res
      .status(HTTP_STATUS.CREATED)
      .json(successResponse(created, "Adjustment created successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/adjustments/:id
 * Updates an existing adjustment (only provided fields).
 */
export const updateAdjustment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId = getOwnerUserId(req);
    const { id } = req.params;
    const { date, amount, employerId, shiftId, note } = req.body;

    const updated = await adjustmentService.updateAdjustment(ownerUserId, id, {
      date,
      amount,
      employerId,
      shiftId,
      note,
    });

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(updated, "Adjustment updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/adjustments/:id
 * Deletes an adjustment that belongs to the current user.
 */
export const deleteAdjustment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerUserId = getOwnerUserId(req);
    const { id } = req.params;

    await adjustmentService.deleteAdjustment(ownerUserId, id);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(null, "Adjustment deleted successfully"));
  } catch (error) {
    next(error);
  }
};
