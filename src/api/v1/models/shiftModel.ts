/**
 * Represents a work shift recorded by a specific user for a specific employer.
 * Note: At the API boundary you will accept ISO datetime strings.
 * In the service/repository layer these should be converted to Date objects.
 */
export interface Shift {
  /** Unique identifier of the shift. */
  id: string;
  /** Owner user identifier (Firebase Authentication user id). */
  ownerUserId: string;
  /** Identifier of the employer this shift belongs to. */
  employerId: string;
  /** Shift start time (stored as Date in the domain model). */
  startTime: Date;
  /** Shift end time (stored as Date in the domain model). */
  endTime: Date;
  /**
   * Optional tips associated with this shift.
   * Positive numbers represent tip earnings; default is undefined.
   */
  tips?: number;
  /** Record creation time. */
  createdAt: Date;
  /** Record last update time. */
  updatedAt: Date;
}

/**
 * Input for creating a new Shift.
 * Only fields allowed from client requests.
 * Times are expected as ISO strings at the API boundary;
 * the service will convert them to Date objects.
 */
export interface CreateShiftInput {
  employerId: string;
  startTime: string; // ISO datetime string
  endTime: string;   // ISO datetime string
  tips?: number;
}

/**
 * Input for updating an existing Shift.
 * All fields are optional and will be merged.
 * At least one field should be provided by the caller.
 */
export interface UpdateShiftInput {
  employerId?: string;
  startTime?: string; // ISO datetime string
  endTime?: string;   // ISO datetime string
  tips?: number;
}
