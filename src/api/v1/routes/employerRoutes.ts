import express, { Router } from "express";
import * as employerController from "../controllers/employerController";

const router: Router = Router();

/**
 * GET /api/v1/employers
 * Lists employers.
 * Currently returns an empty array as a placeholder.
 */
router.get("/", employerController.getAllEmployers);

export default router;
