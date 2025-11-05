import { Router } from "express";
import * as employerController from "../controllers/employerController";

const router: Router = Router();

/**
 * GET /api/v1/employers
 * Lists all employers for the current user.
 */
router.get("/", employerController.listEmployers);

/**
 * POST /api/v1/employers
 * Creates a new employer for the current user.
 */
router.post("/", employerController.createEmployer);

/**
 * GET /api/v1/employers/:id
 * Retrieves one employer by id (must belong to current user).
 */
router.get("/:id", employerController.getEmployer);

/**
 * PUT /api/v1/employers/:id
 * Updates an employer (must belong to current user).
 */
router.put("/:id", employerController.updateEmployer);

/**
 * DELETE /api/v1/employers/:id
 * Deletes an employer (must belong to current user).
 */
router.delete("/:id", employerController.deleteEmployer);

export default router;
