import express, { Router } from "express";
import * as shiftController from "../controllers/shiftController";

const router: Router = express.Router();

/**
 * GET /api/v1/shifts
 * Retrieves a list of shifts.
 * Currently returns an empty array as a placeholder.
 */
router.get("/", shiftController.getAllShifts);

export default router;
