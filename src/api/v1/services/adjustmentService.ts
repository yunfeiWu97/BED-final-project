import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../repositories/firestoreRepository";
import {
  Adjustment,
  CreateAdjustmentInput,
  UpdateAdjustmentInput,
} from "../models/adjustmentModel";

/** Firestore collection name for adjustments. */
const COLLECTION_NAME = "adjustments";

/**
 * Convert a Firestore Timestamp-like value or a Date into a Date instance.
 * Supports plain Date objects and Firestore Timestamp objects.
 * @param value - Unknown value that should represent a date/time.
 * @returns JavaScript Date instance.
 */
const toDateFromUnknown = (value: unknown): Date => {
  const timestampLike = value as { toDate?: () => Date };
  if (timestampLike && typeof timestampLike.toDate === "function") {
    return timestampLike.toDate() as Date;
  }
  return value as Date;
};

/**
 * Retrieves all adjustments that belong to the given user.
 * Optional filters:
 *  - employerId: only return adjustments linked to this employer
 *  - shiftId: only return adjustments linked to this shift
 *
 * @param ownerUserId - Firebase Authentication user identifier.
 * @param options - Optional filter options.
 * @returns List of adjustments satisfying ownership and filters.
 */
export const getAllAdjustments = async (
  ownerUserId: string,
  options?: { employerId?: string; shiftId?: string }
): Promise<Adjustment[]> => {
  const snapshot = await getDocuments(COLLECTION_NAME);

  const items: Adjustment[] = snapshot.docs
    .map((document) => {
      const data = document.data() as Omit<Adjustment, "id">;

      return {
        id: document.id,
        ownerUserId: data.ownerUserId,
        date: toDateFromUnknown(data.date),
        amount: data.amount,
        employerId: data.employerId,
        shiftId: data.shiftId,
        note: data.note,
        createdAt: toDateFromUnknown(data.createdAt),
        updatedAt: toDateFromUnknown(data.updatedAt),
      } as Adjustment;
    })
    .filter((a) => a.ownerUserId === ownerUserId)
    .filter((a) => (options?.employerId ? a.employerId === options.employerId : true))
    .filter((a) => (options?.shiftId ? a.shiftId === options.shiftId : true));

  return items;
};

/**
 * Creates a new adjustment for the given user.
 * Converts the incoming ISO date string into a Date object.
 *
 * @param ownerUserId - Firebase Authentication user identifier.
 * @param input - Fields allowed from client requests.
 * @returns The created adjustment with a generated identifier.
 */
export const createAdjustment = async (
  ownerUserId: string,
  input: CreateAdjustmentInput
): Promise<Adjustment> => {
  const now = new Date();
  const payload: Omit<Adjustment, "id"> = {
    ownerUserId,
    date: new Date(input.date),
    amount: input.amount,
    employerId: input.employerId,
    shiftId: input.shiftId,
    note: input.note,
    createdAt: now,
    updatedAt: now,
  };

  const createdId = await createDocument<Adjustment>(COLLECTION_NAME, payload);
  return structuredClone({ id: createdId, ...payload } as Adjustment);
};

/**
 * Retrieves a single adjustment by identifier if it belongs to the given user.
 *
 * @param ownerUserId - Firebase Authentication user identifier.
 * @param adjustmentId - The identifier of the adjustment to retrieve.
 * @returns The adjustment if found and owned by the user.
 * @throws Error - If the document does not exist or belongs to another user.
 */
export const getAdjustmentById = async (
  ownerUserId: string,
  adjustmentId: string
): Promise<Adjustment> => {
  const document = await getDocumentById(COLLECTION_NAME, adjustmentId);
  if (!document?.exists) {
    throw new Error(`Adjustment with id ${adjustmentId} not found`);
  }

  const data = document.data() as Omit<Adjustment, "id">;
  if (data.ownerUserId !== ownerUserId) {
    throw new Error(`Adjustment with id ${adjustmentId} not found`);
  }

  return structuredClone({
    id: document.id,
    ownerUserId: data.ownerUserId,
    date: toDateFromUnknown(data.date),
    amount: data.amount,
    employerId: data.employerId,
    shiftId: data.shiftId,
    note: data.note,
    createdAt: toDateFromUnknown(data.createdAt),
    updatedAt: toDateFromUnknown(data.updatedAt),
  } as Adjustment);
};

/**
 * Updates an existing adjustment (only provided fields) after verifying ownership.
 * The `updatedAt` field is always refreshed.
 *
 * @param ownerUserId - Firebase Authentication user identifier.
 * @param adjustmentId - The identifier of the adjustment to update.
 * @param input - Partial update payload (date is ISO string at API boundary).
 * @returns The updated adjustment (existing fields merged with changes).
 * @throws Error - If the document does not exist or belongs to another user.
 */
export const updateAdjustment = async (
  ownerUserId: string,
  adjustmentId: string,
  input: UpdateAdjustmentInput
): Promise<Adjustment> => {
  const existing = await getAdjustmentById(ownerUserId, adjustmentId);

  const updateData: Partial<Adjustment> = {
    ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
    ...(input.employerId !== undefined ? { employerId: input.employerId } : {}),
    ...(input.shiftId !== undefined ? { shiftId: input.shiftId } : {}),
    ...(input.note !== undefined ? { note: input.note } : {}),
    updatedAt: new Date(),
  };

  await updateDocument<Adjustment>(COLLECTION_NAME, existing.id, updateData);
  return structuredClone({ ...existing, ...updateData } as Adjustment);
};

/**
 * Deletes an adjustment after verifying ownership.
 *
 * @param ownerUserId - Firebase Authentication user identifier.
 * @param adjustmentId - The identifier of the adjustment to delete.
 * @returns A promise that resolves when deletion completes.
 * @throws Error - If the document does not exist or belongs to another user.
 */
export const deleteAdjustment = async (
  ownerUserId: string,
  adjustmentId: string
): Promise<void> => {
  const existing = await getAdjustmentById(ownerUserId, adjustmentId);
  await deleteDocument(COLLECTION_NAME, existing.id);
};
