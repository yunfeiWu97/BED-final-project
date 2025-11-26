import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../repositories/firestoreRepository";
import {
  Employer,
  CreateEmployerInput,
  UpdateEmployerInput,
} from "../models/employerModel";

/** Firestore collection name for employers. */
const COLLECTION = "employers";

/**
 * Retrieves all employers owned by the given user.
 * @param ownerUserId - Firebase Authentication user id
 * @returns List of employers
 */
export const getAllEmployers = async (
  ownerUserId: string
): Promise<Employer[]> => {
  const snapshot = await getDocuments(COLLECTION);

  const employers: Employer[] = snapshot.docs
    .map((doc) => {
      const data = doc.data() as Omit<Employer, "id">;

      const createdAt =
        (data.createdAt as unknown as FirebaseFirestore.Timestamp)?.toDate?.() ??
        (data.createdAt as Date);
      const updatedAt =
        (data.updatedAt as unknown as FirebaseFirestore.Timestamp)?.toDate?.() ??
        (data.updatedAt as Date);

      return {
        id: doc.id,
        ownerUserId: data.ownerUserId,
        name: data.name,
        hourlyRate: data.hourlyRate,
        createdAt,
        updatedAt,
      } as Employer;
    })
    .filter((employer) => employer.ownerUserId === ownerUserId);

  return employers;
};

/**
 * Creates a new employer for the given user.
 * @param ownerUserId - Firebase Authentication user id
 * @param input - Fields allowed from client
 * @returns The created employer
 */
export const createEmployer = async (
  ownerUserId: string,
  input: CreateEmployerInput
): Promise<Employer> => {
  const now = new Date();
  const payload: Omit<Employer, "id"> = {
    ownerUserId,
    name: input.name,
    hourlyRate: input.hourlyRate,
    createdAt: now,
    updatedAt: now,
  };

  const id: string = await createDocument<Employer>(COLLECTION, payload);
  return structuredClone({ id, ...payload } as Employer);
};

/**
 * Retrieves a single employer by id if it belongs to the user.
 * @param ownerUserId - Firebase Authentication user id
 * @param employerId - Employer id
 * @returns The employer
 * @throws Error if not found or not owned by the user
 */
export const getEmployerById = async (
  ownerUserId: string,
  employerId: string
): Promise<Employer> => {
  const doc = await getDocumentById(COLLECTION, employerId);
  if (!doc?.exists) {
    throw new Error(`Employer with id ${employerId} not found`);
  }

  const data = doc.data() as Omit<Employer, "id">;
  if (data.ownerUserId !== ownerUserId) {
    throw new Error(`Employer with id ${employerId} not found`);
  }

  const createdAt =
    (data.createdAt as unknown as FirebaseFirestore.Timestamp)?.toDate?.() ??
    (data.createdAt as Date);
  const updatedAt =
    (data.updatedAt as unknown as FirebaseFirestore.Timestamp)?.toDate?.() ??
    (data.updatedAt as Date);

  return structuredClone({
    id: doc.id,
    ownerUserId: data.ownerUserId,
    name: data.name,
    hourlyRate: data.hourlyRate,
    createdAt,
    updatedAt,
  } as Employer);
};

/**
 * Updates an employer (only provided fields) if it belongs to the user.
 * @param ownerUserId - Firebase Authentication user id
 * @param employerId - Employer id
 * @param input - Fields to update
 * @returns The updated employer
 * @throws Error if not found or not owned by the user
 */
export const updateEmployer = async (
  ownerUserId: string,
  employerId: string,
  input: UpdateEmployerInput
): Promise<Employer> => {
  const existing: Employer = await getEmployerById(ownerUserId, employerId);

  const updateData: Partial<Employer> = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.hourlyRate !== undefined
      ? { hourlyRate: input.hourlyRate }
      : {}),
    updatedAt: new Date(),
  };

  await updateDocument<Employer>(COLLECTION, existing.id, updateData);

  // Return the merged result
  return structuredClone({ ...existing, ...updateData } as Employer);
};

/**
 * Deletes an employer if it belongs to the user.
 * @param ownerUserId - Firebase Authentication user id
 * @param employerId - Employer id
 * @throws Error if not found or not owned by the user
 */
export const deleteEmployer = async (
  ownerUserId: string,
  employerId: string
): Promise<void> => {
  const existing: Employer = await getEmployerById(ownerUserId, employerId);
  await deleteDocument(COLLECTION, existing.id);
};
