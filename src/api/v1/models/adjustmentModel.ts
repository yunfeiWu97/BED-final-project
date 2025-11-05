/**
 * Represents an allowance or deduction not tied to hours directly.
 * An adjustment can optionally be linked to an employer or to a specific shift
 */
export interface Adjustment {
  /** Unique identifier of the adjustment. */
  id: string;
  /** Owner user identifier (Firebase Authentication user id). */
  ownerUserId: string;
  /**
   * Business date this adjustment applies to (domain model as Date).
   * At the API boundary this will be accepted as an ISO date string.
   */
  date: Date;
  /**
   * Positive or negative amount. Positive means allowance/bonus;
   * negative means deduction/penalty.
   */
  amount: number;
  /**
   * Optional link to an employer. Provide at least one of employerId or shiftId.
   * This constraint will be enforced by validation later.
   */
  employerId?: string;
  /**
   * Optional link to a specific shift. Provide at least one of employerId or shiftId.
   * This constraint will be enforced by validation later.
   */
  shiftId?: string;
  /** Optional short note describing the reason for the adjustment. */
  note?: string;
  /** Record creation time. */
  createdAt: Date;
  /** Record last update time. */
  updatedAt: Date;
}

/**
 * Input for creating a new Adjustment.
 * At the API boundary, date is expected as an ISO date string (e.g., "2025-11-05").
 * The service layer will convert it to a Date object.
 */
export interface CreateAdjustmentInput {
  date: string; // ISO date string (YYYY-MM-DD or full ISO)
  amount: number;
  employerId?: string;
  shiftId?: string;
  note?: string;
}

/**
 * Input for updating an existing Adjustment.
 * All fields are optional; the service will merge defined fields only.
 */
export interface UpdateAdjustmentInput {
  date?: string; // ISO date string
  amount?: number;
  employerId?: string;
  shiftId?: string;
  note?: string;
}
