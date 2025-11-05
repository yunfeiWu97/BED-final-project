/**
 * Represents an Employer entity owned by a specific user.
 */
export interface Employer {
  /** Unique identifier of the employer. */
  id: string;
  /** Owner user identifier (Firebase Authentication user id). */
  ownerUserId: string;
  /** Human-readable employer name. */
  name: string;
  /** Fixed hourly pay rate for this employer. */
  hourlyRate: number;
  /** Record creation time. */
  createdAt: Date;
  /** Record last update time. */
  updatedAt: Date;
}

/**
 * Input for creating a new Employer.
 * Only fields allowed from client requests.
 */
export interface CreateEmployerInput {
  name: string;
  hourlyRate: number;
}

/**
 * Input for updating an Employer.
 * All fields are optional and will be merged.
 */
export interface UpdateEmployerInput {
  name?: string;
  hourlyRate?: number;
}
