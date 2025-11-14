import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../repositories/firestoreRepository";
import {
  Shift,
  CreateShiftInput,
  UpdateShiftInput,
} from "../models/shiftModel";

const COLLECTION_NAME = "shifts";

/** An item enriched with computed fields for presentation. */
export interface ShiftWithComputed extends Shift {
  /** Duration in hours (rounded to 2 decimals). */
  hours: number;
  /** Effective pay = hours × rate + tips (rounded to 2 decimals). */
  pay: number;
}

/** Totals container used by GET /shifts?includeTotals=true. */
export interface ShiftTotals {
  byDay: Record<string, { hours: number; pay: number }>;
  byMonth: Record<string, { hours: number; pay: number }>;
}

/**
 * Convert a Firestore Timestamp-like value or a Date into a Date.
 * Supports plain Date and Firestore Timestamp objects.
 * @param value - Unknown value that should represent a date/time.
 * @returns A JavaScript Date.
 */
const toDateFromUnknown = (value: unknown): Date => {
  const maybeTimestamp = value as { toDate?: () => Date };
  if (maybeTimestamp && typeof maybeTimestamp.toDate === "function") {
    return maybeTimestamp.toDate() as Date;
  }
  return value as Date;
};

/** Format helpers for grouping keys. */
const formatIsoDate = (date: Date): string => date.toISOString().slice(0, 10); // YYYY-MM-DD
const formatYearMonth = (date: Date): string => date.toISOString().slice(0, 7); // YYYY-MM

/** Convert milliseconds to hours and round to 2 decimals. */
const millisecondsToHours = (milliseconds: number): number =>
  Math.round((milliseconds / 3_600_000) * 100) / 100;

/**
 * Load an employer's hourly rate.
 * Supports both `rate` and `hourlyRate` field names and falls back to 0.
 * @param employerId - Employer identifier.
 * @returns Numeric hourly rate (>= 0).
 */
const getEmployerHourlyRate = async (employerId: string): Promise<number> => {
  const document = await getDocumentById("employers", employerId);
  const data = document?.data?.();
  if (!data) return 0;
  const candidate = (data.rate ?? data.hourlyRate ?? 0) as number;
  return typeof candidate === "number" && candidate > 0 ? candidate : 0;
};

/**
 * Compute {hours, pay} for a shift using the given hourly rate.
 * @param shift - The shift to evaluate.
 * @param employerRate - Employer hourly rate.
 * @returns An object with hours and pay.
 */
const computeHoursAndPay = (
  shift: Shift,
  employerRate: number
): { hours: number; pay: number } => {
  const milliseconds = shift.endTime.getTime() - shift.startTime.getTime();
  const hours = millisecondsToHours(milliseconds);
  const pay = Math.round((hours * employerRate + (shift.tips ?? 0)) * 100) / 100;
  return { hours, pay };
};

/**
 * Aggregate totals by a key selector.
 * @param items - List of enriched shifts.
 * @param keySelector - Function mapping shift -> grouping key.
 * @returns A record keyed by group with {hours, pay}.
 */
const aggregateTotals = (
  items: ShiftWithComputed[],
  keySelector: (shift: ShiftWithComputed) => string
): Record<string, { hours: number; pay: number }> => {
  const totals: Record<string, { hours: number; pay: number }> = {};
  for (const shiftItem of items) {
    const groupingKey = keySelector(shiftItem);
    if (!totals[groupingKey]) totals[groupingKey] = { hours: 0, pay: 0 };
    totals[groupingKey].hours += shiftItem.hours;
    totals[groupingKey].pay += shiftItem.pay;
  }
  // Round for presentation
  for (const key of Object.keys(totals)) {
    totals[key].hours = Math.round(totals[key].hours * 100) / 100;
    totals[key].pay = Math.round(totals[key].pay * 100) / 100;
  }
  return totals;
};

/**
 * Retrieve all shifts for a specific user.
 * Optionally filter by employer and optionally include aggregated totals.
 *
 * Each returned item includes:
 *  - hours: duration in hours
 *  - pay:   hours × employerRate + tips
 *
 * When includeTotals is true, response also contains:
 *  - totals.byDay[YYYY-MM-DD]  = {hours, pay}
 *  - totals.byMonth[YYYY-MM]   = {hours, pay}
 *
 * @param ownerUserId - Firebase Authentication user identifier of the owner.
 * @param options - Filtering and aggregation options.
 * @param options.employerId - Optional employer filter.
 * @param options.includeTotals - Whether to include grouped totals.
 */
export const getAllShifts = async (
  ownerUserId: string,
  options?: { employerId?: string; includeTotals?: boolean }
): Promise<{ items: ShiftWithComputed[]; totals?: ShiftTotals }> => {
  // Load all shift documents (Milestone 1: simple read, filter in memory)
  const snapshot = await getDocuments(COLLECTION_NAME);

  // Map raw docs to Shift model and filter by owner / employer
  const userShifts: Shift[] = snapshot.docs
    .map((document) => {
      const data = document.data() as Omit<Shift, "id">;
      return {
        id: document.id,
        ownerUserId: data.ownerUserId,
        employerId: data.employerId,
        startTime: toDateFromUnknown(data.startTime),
        endTime: toDateFromUnknown(data.endTime),
        tips: data.tips,
        createdAt: toDateFromUnknown(data.createdAt),
        updatedAt: toDateFromUnknown(data.updatedAt),
      } as Shift;
    })
    .filter((shift) => shift.ownerUserId === ownerUserId)
    .filter((shift) =>
      options?.employerId ? shift.employerId === options.employerId : true
    );

  // Cache employer rates to avoid repeated lookups
  const employerRateCache = new Map<string, number>();

  const shiftsWithComputed: ShiftWithComputed[] = [];
  for (const shiftItem of userShifts) {
    let employerRate = employerRateCache.get(shiftItem.employerId);
    if (employerRate === undefined) {
      employerRate = await getEmployerHourlyRate(shiftItem.employerId);
      employerRateCache.set(shiftItem.employerId, employerRate);
    }
    const { hours, pay } = computeHoursAndPay(shiftItem, employerRate);
    shiftsWithComputed.push({ ...shiftItem, hours, pay });
  }

  if (options?.includeTotals) {
    const byDay = aggregateTotals(
      shiftsWithComputed,
      (shift) => formatIsoDate(shift.startTime)
    );
    const byMonth = aggregateTotals(
      shiftsWithComputed,
      (shift) => formatYearMonth(shift.startTime)
    );
    return { items: shiftsWithComputed, totals: { byDay, byMonth } };
  }
  return { items: shiftsWithComputed };
};

/**
 * Create a new shift for a specific user.
 * Incoming times are normalized to ISO by validator; convert to Date here.
 *
 * @param ownerUserId - Firebase Authentication user identifier of the owner.
 * @param input - Fields allowed from client requests.
 * @returns The created shift with a generated identifier.
 */
export const createShift = async (
  ownerUserId: string,
  input: CreateShiftInput
): Promise<Shift> => {
  const now = new Date();
  const payload: Omit<Shift, "id"> = {
    ownerUserId,
    employerId: input.employerId,
    startTime: new Date(input.startTime),
    endTime: new Date(input.endTime),
    tips: input.tips,
    createdAt: now,
    updatedAt: now,
  };

  const createdId = await createDocument<Shift>(COLLECTION_NAME, payload);
  return structuredClone({ id: createdId, ...payload } as Shift);
};

/**
 * Retrieve a single shift by identifier if it belongs to the given user.
 *
 * @param ownerUserId - Firebase Authentication user identifier of the owner.
 * @param shiftId - Identifier of the shift to retrieve.
 * @throws Error - If the shift does not exist or is owned by another user.
 */
export const getShiftById = async (
  ownerUserId: string,
  shiftId: string
): Promise<Shift> => {
  const document = await getDocumentById(COLLECTION_NAME, shiftId);
  if (!document?.exists) {
    throw new Error(`Shift with id ${shiftId} not found`);
  }
  const data = document.data() as Omit<Shift, "id">;
  if (data.ownerUserId !== ownerUserId) {
    throw new Error(`Shift with id ${shiftId} not found`);
  }

  return structuredClone({
    id: document.id,
    ownerUserId: data.ownerUserId,
    employerId: data.employerId,
    startTime: toDateFromUnknown(data.startTime),
    endTime: toDateFromUnknown(data.endTime),
    tips: data.tips,
    createdAt: toDateFromUnknown(data.createdAt),
    updatedAt: toDateFromUnknown(data.updatedAt),
  } as Shift);
};

/**
 * Update an existing shift (only the fields that are provided) after verifying ownership.
 * The `updatedAt` field is always refreshed.
 *
 * @param ownerUserId - Firebase Authentication user identifier of the owner.
 * @param shiftId - Identifier of the shift to update.
 * @param input - A partial update payload. ISO strings for time fields are converted to Date.
 * @returns The updated shift (existing fields merged with changes).
 * @throws Error - If the shift does not exist or is owned by another user.
 */
export const updateShift = async (
  ownerUserId: string,
  shiftId: string,
  input: UpdateShiftInput
): Promise<Shift> => {
  const existing = await getShiftById(ownerUserId, shiftId);

  const updateData: Partial<Shift> = {
    ...(input.employerId !== undefined ? { employerId: input.employerId } : {}),
    ...(input.startTime !== undefined
      ? { startTime: new Date(input.startTime) }
      : {}),
    ...(input.endTime !== undefined ? { endTime: new Date(input.endTime) } : {}),
    ...(input.tips !== undefined ? { tips: input.tips } : {}),
    updatedAt: new Date(),
  };

  await updateDocument<Shift>(COLLECTION_NAME, existing.id, updateData);
  return structuredClone({ ...existing, ...updateData } as Shift);
};

/**
 * Delete a shift after verifying that it belongs to the given user.
 *
 * @param ownerUserId - Firebase Authentication user identifier of the owner.
 * @param shiftId - Identifier of the shift to delete.
 */
export const deleteShift = async (
  ownerUserId: string,
  shiftId: string
): Promise<void> => {
  const existing = await getShiftById(ownerUserId, shiftId);
  await deleteDocument(COLLECTION_NAME, existing.id);
};
