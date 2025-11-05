import { Router, Request, Response } from "express";
import { successResponse } from "../models/responseModel";
import { HTTP_STATUS } from "../../../constants/httpConstants";

const router: Router = Router();

/**
 * GET /api/v1/adjustments
 * Placeholder endpoint to verify that the adjustments router is created.
 * @returns 200 OK with a standardized success envelope.
 */
router.get("/", (_request: Request, response: Response) => {
  response
    .status(HTTP_STATUS.OK)
    .json(successResponse(null, "Adjustments route is reachable"));
});

export default router;
