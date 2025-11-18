import { Router } from "express";
import * as employerController from "../controllers/employerController";
import { validateRequest } from "../middleware/validate";
import { employerSchemas } from "../validations/employerValidation";
import { writeLimiter } from "../../../../config/rateLimitConfig"; 

const router: Router = Router();

/**
 * Route group: Employers
 * Routes under `/api/v1/employers`.
 */

/**
 * @openapi
 * /employers:
 *   get:
 *     summary: List employers for the current user
 *     description: Returns employers owned by the caller（Milestone 1）.
 *     tags: [Employers]
 *     responses:
 *       200:
 *         description: A list of employers wrapped in a standard response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employer'
 *                 message:
 *                   type: string
 *                   example: Employers successfully retrieved
 */
router.get("/", employerController.listEmployers);

/**
 * @openapi
 * /employers:
 *   post:
 *     summary: Create a new employer
 *     tags: [Employers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, hourlyRate]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Guarana Restaurant"
 *               hourlyRate:
 *                 type: number
 *                 example: 16.5
 *     responses:
 *       201:
 *         description: Created employer wrapped in a response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Employer'
 *                 message:
 *                   type: string
 *                   example: Employer created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  validateRequest(employerSchemas.create),
  employerController.createEmployer
);

/**
 * @openapi
 * /employers/{id}:
 *   get:
 *     summary: Get one employer by id
 *     tags: [Employers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employer id
 *     responses:
 *       200:
 *         description: Employer wrapped in a standard response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Employer'
 *                 message:
 *                   type: string
 *                   example: Employer retrieved successfully
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  validateRequest(employerSchemas.paramsWithId),
  employerController.getEmployer
);

/**
 * @openapi
 * /employers/{id}:
 *   put:
 *     summary: Update an employer
 *     tags: [Employers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employer id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Name"
 *               hourlyRate:
 *                 type: number
 *                 example: 18
 *     responses:
 *       200:
 *         description: Updated employer wrapped in a response envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Employer'
 *                 message:
 *                   type: string
 *                   example: Employer updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  writeLimiter,
  validateRequest(employerSchemas.update),
  employerController.updateEmployer
);

/**
 * @openapi
 * /employers/{id}:
 *   delete:
 *     summary: Delete an employer
 *     tags: [Employers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employer id
 *     responses:
 *       200:
 *         description: Deletion result wrapped in a response envelope (data is null)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: Employer deleted successfully
 *       404:
 *         description: Not found
 */
router.delete(
  "/:id",
  writeLimiter,
  validateRequest(employerSchemas.paramsWithId),
  employerController.deleteEmployer
);

export default router;
