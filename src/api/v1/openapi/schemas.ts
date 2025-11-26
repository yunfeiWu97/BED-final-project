/**
 * @openapi
 * components:
 *   schemas:
 *     Employer:
 *       type: object
 *       required: [id, ownerUserId, name, hourlyRate, createdAt, updatedAt]
 *       properties:
 *         id:           { type: string, example: "emp_123" }
 *         ownerUserId:  { type: string, example: "demo-user" }
 *         name:         { type: string, example: "Guarana Restaurant" }
 *         hourlyRate:   { type: number, example: 16.5 }
 *         createdAt:    { type: string, format: date-time, example: "2025-01-01T12:00:00Z" }
 *         updatedAt:    { type: string, format: date-time, example: "2025-01-01T12:10:00Z" }
 *
 *     Shift:
 *       type: object
 *       required: [id, ownerUserId, employerId, startTime, endTime, createdAt, updatedAt]
 *       properties:
 *         id:           { type: string, example: "shift_123" }
 *         ownerUserId:  { type: string, example: "demo-user" }
 *         employerId:   { type: string, example: "emp_123" }
 *         startTime:    { type: string, format: date-time, example: "2025-01-04T09:00:00Z" }
 *         endTime:      { type: string, format: date-time, example: "2025-01-04T17:00:00Z" }
 *         durationHours:{ type: number, example: 8 }
 *         tips:         { type: number, example: 25 }
 *         createdAt:    { type: string, format: date-time }
 *         updatedAt:    { type: string, format: date-time }
 *
 *     Adjustment:
 *       type: object
 *       required: [id, ownerUserId, date, amount, createdAt, updatedAt]
 *       properties:
 *         id:           { type: string, example: "adj_123" }
 *         ownerUserId:  { type: string, example: "demo-user" }
 *         date:         { type: string, format: date, example: "2025-01-10" }
 *         amount:       { type: number, example: -12.5 }
 *         employerId:   { type: string, nullable: true, example: "emp_123" }
 *         shiftId:      { type: string, nullable: true, example: "shift_123" }
 *         note:         { type: string, example: "Uniform fee" }
 *         createdAt:    { type: string, format: date-time }
 *         updatedAt:    { type: string, format: date-time }
 */
export {};
