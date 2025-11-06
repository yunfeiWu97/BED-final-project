import express, { Router } from "express";
import * as adjustmentController from "../controllers/adjustmentController";

const router: Router = express.Router();

/**
 * GET /api/v1/adjustments
 * Retrieves a list of adjustments.
 * Currently returns an empty array as a placeholder.
 */
router.get("/", adjustmentController.getAllAdjustments);

export default router;
