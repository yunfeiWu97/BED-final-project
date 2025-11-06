import { Router } from "express";
import * as employerController from "../controllers/employerController";
import { validateRequest } from "../middleware/validate";
import { employerSchemas } from "../validations/employerValidation";

const router: Router = Router();

/** Lists all employers for the current user. */
router.get("/", employerController.listEmployers);

/** Creates a new employer for the current user. */
router.post(
  "/",
  validateRequest(employerSchemas.create),
  employerController.createEmployer
);

/** Retrieves one employer by id (must belong to current user). */
router.get(
  "/:id",
  validateRequest(employerSchemas.paramsWithId),
  employerController.getEmployer
);

/** Updates an employer (must belong to current user). */
router.put(
  "/:id",
  validateRequest(employerSchemas.update),
  employerController.updateEmployer
);

/** Deletes an employer (must belong to current user). */
router.delete(
  "/:id",
  validateRequest(employerSchemas.paramsWithId),
  employerController.deleteEmployer
);

export default router;
