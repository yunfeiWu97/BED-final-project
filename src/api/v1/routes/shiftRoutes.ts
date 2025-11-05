import express, { Router } from "express";
import * as shiftController from "../controllers/shiftController";

const router: Router = express.Router();

/**
 * Lists shifts for the current user.
 * Optional query parameters:
 *   - employerId: string
 *   - includeTotals: "true" | "false"
 */
router.get("/", shiftController.getAllShifts);

/**
 * Retrieves a single shift by identifier.
 */
router.get("/:id", shiftController.getShiftById);

/**
 * Creates a new shift.
 * Body expects:
 *   - employerId: string
 *   - startTime: ISO string
 *   - endTime: ISO string
 *   - tips?: number
 */
router.post("/", shiftController.createShift);

/**
 * Updates an existing shift (only provided fields will be changed).
 * Body supports any of:
 *   - employerId?: string
 *   - startTime?: ISO string
 *   - endTime?: ISO string
 *   - tips?: number
 */
router.put("/:id", shiftController.updateShift);

/**
 * Deletes a shift owned by the current user.
 */
router.delete("/:id", shiftController.deleteShift);

export default router;
