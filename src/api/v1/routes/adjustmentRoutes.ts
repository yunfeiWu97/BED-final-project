import express, { Router } from "express";
import * as adjustmentController from "../controllers/adjustmentController";
import { validateRequest } from "../middleware/validate";
import { adjustmentSchemas } from "../validations/adjustmentValidation";
import { writeLimiter } from "../../../../config/rateLimitConfig";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router: Router = express.Router();

/**
 * Route group: Adjustments
 * Routes under `/api/v1/adjustments`.
 */

/**
 * @openapi
 * /adjustments:
 *   get:
 *     summary: List adjustments for the current user
 *     tags: [Adjustments]
 *     parameters:
 *       - in: query
 *         name: employerId
 *         schema: { type: string }
 *         required: false
 *         description: Filter by employer id
 *       - in: query
 *         name: shiftId
 *         schema: { type: string }
 *         required: false
 *         description: Filter by shift id
 *     responses:
 *       200:
 *         description: Adjustments wrapped in a standard response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 data:
 *                   type: array
 *                   items: { $ref: "#/components/schemas/Adjustment" }
 *                 message: { type: string, example: Adjustments successfully retrieved }
 *       401:
 *         description: Unauthorized (missing or invalid bearer token)
 */
router.get("/", authenticate, adjustmentController.getAllAdjustments);

/**
 * @openapi
 * /adjustments:
 *   post:
 *     summary: Create a new adjustment
 *     tags: [Adjustments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, amount]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               employerId:
 *                 type: string
 *                 nullable: true
 *               shiftId:
 *                 type: string
 *                 nullable: true
 *               note:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       201:
 *         description: Created adjustment wrapped in a response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: "#/components/schemas/Adjustment"
 *                 message:
 *                   type: string
 *                   example: "Adjustment created successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (missing or invalid bearer token)
 *       403:
 *         description: Forbidden (required role missing)
 */
router.post(
  "/",
  authenticate,
  authorize({ hasRole: ["user"] }), 
  writeLimiter,
  validateRequest(adjustmentSchemas.create),
  adjustmentController.createAdjustment
);

/**
 * @openapi
 * /adjustments/{id}:
 *   get:
 *     summary: Get an adjustment by id
 *     tags: [Adjustments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Adjustment wrapped in a response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: "#/components/schemas/Adjustment"
 *                 message:
 *                   type: string
 *                   example: "Adjustment successfully retrieved"
 *       401:
 *         description: Unauthorized (missing or invalid bearer token)
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  authenticate,
  validateRequest(adjustmentSchemas.paramsWithId),
  adjustmentController.getAdjustmentById
);

/**
 * @openapi
 * /adjustments/{id}:
 *   put:
 *     summary: Update an adjustment
 *     tags: [Adjustments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               employerId:
 *                 type: string
 *                 nullable: true
 *               shiftId:
 *                 type: string
 *                 nullable: true
 *               note:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Updated adjustment wrapped in a response envelope
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (missing or invalid bearer token)
 *       403:
 *         description: Forbidden (required role missing)
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  authenticate,
  authorize({ hasRole: ["user"] }),
  writeLimiter,
  validateRequest(adjustmentSchemas.update),
  adjustmentController.updateAdjustment
);

/**
 * @openapi
 * /adjustments/{id}:
 *   delete:
 *     summary: Delete an adjustment
 *     tags: [Adjustments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deletion result wrapped in a response envelope (data is null)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  
 *                    type: string
 *                    example: success
 *                 data: 
 *                    $ref: "#/components/schemas/Adjustment"
 *                 message: 
 *                    type: string
 *                    example: "Adjustment created successfully"
 *       401:
 *         description: Unauthorized (missing or invalid bearer token)
 *       403:
 *         description: Forbidden (required role missing)
 *       404:
 *         description: Not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize({ hasRole: ["user"] }),
  writeLimiter,
  validateRequest(adjustmentSchemas.paramsWithId),
  adjustmentController.deleteAdjustment
);

export default router;
