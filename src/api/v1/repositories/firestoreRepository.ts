import { db } from "../../../../config/firebaseConfig";

/**
 * Creates a document in the given Firestore collection.
 * @typeParam T - The shape of the data being stored.
 * @param collectionName - Name of the Firestore collection.
 * @param data - Partial data to write to Firestore.
 * @param id - Optional document id. If omitted, Firestore will generate one.
 * @returns The id of the created document.
 */
export const createDocument = async <T>(
  collectionName: string,
  data: Partial<T>,
  id?: string
): Promise<string> => {
  let docRef: FirebaseFirestore.DocumentReference;
  if (id) {
    docRef = db.collection(collectionName).doc(id);
    await docRef.set(data);
  } else {
    docRef = await db.collection(collectionName).add(data);
  }
  return docRef.id;
};

/**
 * Gets all documents from a Firestore collection.
 * @param collectionName - Name of the collection to read.
 * @returns A Firestore query snapshot with all documents.
 */
export const getDocuments = async (
  collectionName: string
): Promise<FirebaseFirestore.QuerySnapshot> => {
  return await db.collection(collectionName).get();
};

/**
 * Gets a single document by id from a collection.
 * @param collectionName - Name of the collection.
 * @param id - Document id to read.
 * @returns The document snapshot if it exists, otherwise null.
 */
export const getDocumentById = async (
  collectionName: string,
  id: string
): Promise<FirebaseFirestore.DocumentSnapshot | null> => {
  const doc = await db.collection(collectionName).doc(id).get();
  return doc?.exists ? doc : null;
};

/**
 * Updates a Firestore document with the given data.
 * @typeParam T - The shape of the data being stored.
 * @param collectionName - Name of the collection.
 * @param id - Document id to update.
 * @param data - Partial data to merge into the document.
 */
export const updateDocument = async <T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  await db.collection(collectionName).doc(id).update(data);
};

/**
 * Deletes a Firestore document.
 * @param collectionName - Name of the collection.
 * @param id - Document id to delete.
 */
export const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  await db.collection(collectionName).doc(id).delete();
};
