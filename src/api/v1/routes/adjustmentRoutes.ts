import express, { Router } from "express";
import * as adjustmentController from "../controllers/adjustmentController";
import { validateRequest } from "../middleware/validate";
import { adjustmentSchemas } from "../validations/adjustmentValidation";

const router: Router = express.Router();

/** GET /api/v1/adjustments — list adjustments */
router.get("/", adjustmentController.getAllAdjustments);

/** GET /api/v1/adjustments/:id — get by id */
router.get(
  "/:id",
  validateRequest(adjustmentSchemas.paramsWithId),
  adjustmentController.getAdjustmentById
);

/** POST /api/v1/adjustments — create adjustment */
router.post(
  "/",
  validateRequest(adjustmentSchemas.create),
  adjustmentController.createAdjustment
);

/** PUT /api/v1/adjustments/:id — update adjustment */
router.put(
  "/:id",
  validateRequest(adjustmentSchemas.update),
  adjustmentController.updateAdjustment
);

/** DELETE /api/v1/adjustments/:id — delete adjustment */
router.delete(
  "/:id",
  validateRequest(adjustmentSchemas.paramsWithId),
  adjustmentController.deleteAdjustment
);

export default router;
