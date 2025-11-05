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

/**
 * Name of the Firestore collection that stores Shift documents.
 */
const COLLECTION_NAME = "shifts";

/**
 * Aggregate totals for shifts.
 * - `byDay`: total hours per calendar day in "YYYY-MM-DD" format.
 * - `byMonth`: total hours per calendar month in "YYYY-MM" format.
 */
export interface ShiftTotals {
  byDay: Record<string, number>;
  byMonth: Record<string, number>;
}

/**
 * Convert a Firestore Timestamp-like value or a Date into a Date.
 * This supports plain Date objects and Firestore Timestamp objects.
 * @param value - Unknown value that should represent a date/time.
 * @returns A JavaScript Date instance.
 */
const toDateFromUnknown = (value: unknown): Date => {
  const timestampLike = value as { toDate?: () => Date };
  if (timestampLike && typeof timestampLike.toDate === "function") {
    return timestampLike.toDate() as Date;
  }
  return value as Date;
};

/**
 * Format a Date as an ISO date string (YYYY-MM-DD).
 * @param date - The date to format.
 */
const formatIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Format a Date as a year-month key (YYYY-MM).
 * @param date - The date to format.
 */
const formatYearMonth = (date: Date): string => date.toISOString().slice(0, 7);

/**
 * Convert a duration in milliseconds to hours as a floating point number.
 * @param milliseconds - Duration in milliseconds.
 */
const millisecondsToHours = (milliseconds: number): number =>
  milliseconds / 3_600_000;

/**
 * Compute daily and monthly hour totals for a list of shifts.
 * @param shifts - The list of shifts to aggregate.
 * @returns Totals grouped by day and by month.
 */
const aggregateShiftTotals = (shifts: Shift[]): ShiftTotals => {
  const byDay: Record<string, number> = {};
  const byMonth: Record<string, number> = {};

  for (const shift of shifts) {
    const durationMilliseconds =
      shift.endTime.getTime() - shift.startTime.getTime();
    const durationHours = millisecondsToHours(durationMilliseconds);

    const dayKey = formatIsoDate(shift.startTime);
    const monthKey = formatYearMonth(shift.startTime);

    byDay[dayKey] = (byDay[dayKey] ?? 0) + durationHours;
    byMonth[monthKey] = (byMonth[monthKey] ?? 0) + durationHours;
  }

  return { byDay, byMonth };
};

/**
 * Retrieve all shifts for a specific user.  
 * Optionally filter by employer and optionally include aggregated hour totals.
 *
 * @param ownerUserId - Firebase Authentication user identifier of the owner.
 * @param options - Optional filters and aggregation options.
 * @param options.employerId - If provided, only shifts for this employer are returned.
 * @param options.includeTotals - If true, `totals` with daily and monthly hour aggregates is included.
 * @returns An object with `items` (the list of shifts) and optional `totals`.
 */
export const getAllShifts = async (
  ownerUserId: string,
  options?: { employerId?: string; includeTotals?: boolean }
): Promise<{ items: Shift[]; totals?: ShiftTotals }> => {
  const snapshot = await getDocuments(COLLECTION_NAME);

  const items: Shift[] = snapshot.docs
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

  if (options?.includeTotals) {
    return { items, totals: aggregateShiftTotals(items) };
  }
  return { items };
};

/**
 * Create a new shift for a specific user.  
 * Incoming times are ISO strings at the API boundary and are converted to Date objects here.
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

  const createdIdentifier = await createDocument<Shift>(
    COLLECTION_NAME,
    payload
  );

  return structuredClone({ id: createdIdentifier, ...payload } as Shift);
};

/**
 * Retrieve a single shift by identifier if it belongs to the given user.
 *
 * @param ownerUserId - Firebase Authentication user identifier of the owner.
 * @param shiftId - The identifier of the shift to retrieve.
 * @returns The shift if found and owned by the user.
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
 * @param shiftId - The identifier of the shift to update.
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
 * @param shiftId - The identifier of the shift to delete.
 * @returns A promise that resolves when the deletion has completed.
 * @throws Error - If the shift does not exist or is owned by another user.
 */
export const deleteShift = async (
  ownerUserId: string,
  shiftId: string
): Promise<void> => {
  const existing = await getShiftById(ownerUserId, shiftId);
  await deleteDocument(COLLECTION_NAME, existing.id);
};
