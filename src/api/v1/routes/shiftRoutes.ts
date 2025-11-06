import express, { Router } from "express";
import * as shiftController from "../controllers/shiftController";
import { validateRequest } from "../middleware/validate";
import { shiftSchemas } from "../validations/shiftValidation";

const router: Router = express.Router();

/**
 * Route group: Shifts
 * Routes under `/api/v1/shifts`.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Shift:
 *       type: object
 *       required: [id, ownerUserId, employerId, startTime, endTime, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: string
 *         ownerUserId:
 *           type: string
 *         employerId:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: "2025-01-04T09:00:00Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           example: "2025-01-04T17:00:00Z"
 *         tips:
 *           type: number
 *           example: 25
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ShiftTotals:
 *       type: object
 *       properties:
 *         byDay:
 *           type: object
 *           additionalProperties:
 *             type: number
 *             example: 8
 *         byMonth:
 *           type: object
 *           additionalProperties:
 *             type: number
 *             example: 160
 */

/**
 * @openapi
 * /shifts:
 *   get:
 *     summary: List shifts for the current user
 *     tags: [Shifts]
 *     parameters:
 *       - in: query
 *         name: employerId
 *         schema: { type: string }
 *         required: false
 *         description: Filter by employer id
 *       - in: query
 *         name: includeTotals
 *         schema: { type: string, enum: ["true", "false"] }
 *         required: false
 *         description: When "true", include daily/monthly hour totals
 *     responses:
 *       200:
 *         description: Shifts (and optional totals) wrapped in a standard response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: "#/components/schemas/Shift" }
 *                     totals:
 *                       $ref: "#/components/schemas/ShiftTotals"
 *                 message: { type: string, example: Shifts successfully retrieved }
 */
router.get(
  "/",
  validateRequest(shiftSchemas.listQuery, { stripQuery: false }),
  shiftController.getAllShifts
);

/**
 * @openapi
 * /shifts:
 *   post:
 *     summary: Create a new shift
 *     tags: [Shifts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employerId, startTime, endTime]
 *             properties:
 *               employerId: { type: string, example: "emp_123" }
 *               startTime: { type: string, format: date-time, example: "2025-01-04T09:00:00Z" }
 *               endTime:   { type: string, format: date-time, example: "2025-01-04T17:00:00Z" }
 *               tips:      { type: number, example: 20 }
 *     responses:
 *       201:
 *         description: Created shift wrapped in a response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 data:    { $ref: "#/components/schemas/Shift" }
 *                 message: { type: string, example: Shift created successfully }
 *       400: { description: Validation error }
 */
router.post("/", validateRequest(shiftSchemas.create), shiftController.createShift);

/**
 * @openapi
 * /shifts/{id}:
 *   get:
 *     summary: Get a shift by id
 *     tags: [Shifts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Shift wrapped in a response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 data:    { $ref: "#/components/schemas/Shift" }
 *                 message: { type: string, example: Shift successfully retrieved }
 *       404: { description: Not found }
 */
router.get("/:id", validateRequest(shiftSchemas.paramsWithId), shiftController.getShiftById);

/**
 * @openapi
 * /shifts/{id}:
 *   put:
 *     summary: Update a shift
 *     tags: [Shifts]
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
 *               employerId: { type: string }
 *               startTime:  { type: string, format: date-time }
 *               endTime:    { type: string, format: date-time }
 *               tips:       { type: number }
 *     responses:
 *       200:
 *         description: Updated shift wrapped in a response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 data:    { $ref: "#/components/schemas/Shift" }
 *                 message: { type: string, example: Shift updated successfully }
 *       400: { description: Validation error }
 *       404: { description: Not found }
 */
router.put("/:id", validateRequest(shiftSchemas.update), shiftController.updateShift);

/**
 * @openapi
 * /shifts/{id}:
 *   delete:
 *     summary: Delete a shift
 *     tags: [Shifts]
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
 *                 status:  { type: string, example: success }
 *                 data:    { nullable: true, example: null }
 *                 message: { type: string, example: Shift deleted successfully }
 *       404: { description: Not found }
 */
router.delete("/:id", validateRequest(shiftSchemas.paramsWithId), shiftController.deleteShift);

export default router;
