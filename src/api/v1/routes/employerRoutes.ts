import { Router, Request, Response } from "express";
import { EmployerController } from "../controllers/employerController";

const router: Router = Router();

/**
 * GET /api/v1/employers
 * Lists employers.
 * Currently returns an empty array as a placeholder.
 */
router.get("/", EmployerController.listEmployers);

export default router;
