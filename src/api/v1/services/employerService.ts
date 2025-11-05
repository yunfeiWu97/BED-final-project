import { Employer } from "../models/employerModel";

/**
 * Retrieves all employers for the current user.
 * Placeholder implementation that returns an empty list.
 *
 * @returns A promise that resolves to an array of Employer entities.
 */
export async function getAllEmployers(): Promise<Employer[]> {
  // TODO: Replace with Firestore repository call in a later step.
  return [];
}
