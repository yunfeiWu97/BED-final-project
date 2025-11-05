import express, { Router } from "express";
import * as shiftController from "../controllers/shiftController";
import { validateRequest } from "../middleware/validate";
import { shiftSchemas } from "../validations/shiftValidation";

const router: Router = express.Router();

/** GET /api/v1/shifts — list shifts (optional employerId, includeTotals) */
router.get(
  "/",
  validateRequest(shiftSchemas.listQuery, { stripQuery: false }),
  shiftController.getAllShifts
);

/** GET /api/v1/shifts/:id — get by id */
router.get(
  "/:id",
  validateRequest(shiftSchemas.paramsWithId),
  shiftController.getShiftById
);

/** POST /api/v1/shifts — create shift */
router.post(
  "/",
  validateRequest(shiftSchemas.create),
  shiftController.createShift
);

/** PUT /api/v1/shifts/:id — update shift */
router.put(
  "/:id",
  validateRequest(shiftSchemas.update),
  shiftController.updateShift
);

/** DELETE /api/v1/shifts/:id — delete shift */
router.delete(
  "/:id",
  validateRequest(shiftSchemas.paramsWithId),
  shiftController.deleteShift
);

export default router;
