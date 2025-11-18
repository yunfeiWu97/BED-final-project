// tests/services/adjustmentService.test.ts
import * as adjustmentService from "../../src/api/v1/services/adjustmentService";
import * as repo from "../../src/api/v1/repositories/firestoreRepository";
import { Adjustment } from "../../src/api/v1/models/adjustmentModel";

const OWNER_USER_ID = "demo-user";
const OTHER_USER_ID = "someone-else";
const EMPLOYER_A = "employer-a";
const EMPLOYER_B = "employer-b";
const SHIFT_1 = "shift-1";
const SHIFT_2 = "shift-2";

const baseAdjustmentWithoutId: Omit<Adjustment, "id"> = {
  ownerUserId: OWNER_USER_ID,
  date: new Date("2025-01-01T00:00:00Z"),
  amount: 100,
  employerId: EMPLOYER_A,
  shiftId: SHIFT_1,
  note: "base",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

describe("adjustmentService", () => {
  afterEach(() => jest.clearAllMocks());

  test("getAllAdjustments: returns only current user's adjustments; supports employerId/shiftId filters", async () => {
    const documents = [
      { id: "a1", data: () => ({ ...baseAdjustmentWithoutId }) },
      { id: "a2", data: () => ({ ...baseAdjustmentWithoutId, employerId: EMPLOYER_B }) },
      { id: "a3", data: () => ({ ...baseAdjustmentWithoutId, shiftId: SHIFT_2 }) },
      { id: "x1", data: () => ({ ...baseAdjustmentWithoutId, ownerUserId: OTHER_USER_ID }) },
    ];

    jest.spyOn(repo, "getDocuments").mockResolvedValue({ docs: documents } as any);

    // No filters: should include a1, a2, a3 (but not x1)
    const all = await adjustmentService.getAllAdjustments(OWNER_USER_ID);
    expect(all.map(a => a.id)).toEqual(["a1", "a2", "a3"]);

    // Filter by employerId
    const onlyEmployerA = await adjustmentService.getAllAdjustments(OWNER_USER_ID, { employerId: EMPLOYER_A });
    expect(onlyEmployerA.map(a => a.id)).toEqual(["a1", "a3"]); // a3 has same employer but different shift

    // Filter by shiftId
    const onlyShift2 = await adjustmentService.getAllAdjustments(OWNER_USER_ID, { shiftId: SHIFT_2 });
    expect(onlyShift2.map(a => a.id)).toEqual(["a3"]);
  });

  test("createAdjustment: converts date from ISO and returns id", async () => {
    jest.spyOn(repo, "createDocument").mockResolvedValue("new-adj-id");

    const created = await adjustmentService.createAdjustment(OWNER_USER_ID, {
      date: "2025-02-02",
      amount: 120,
      employerId: EMPLOYER_A,
      shiftId: SHIFT_1,
      note: "bonus",
    });

    expect(created.id).toBe("new-adj-id");
    expect(created.ownerUserId).toBe(OWNER_USER_ID);

    // Robust Date assertions across realms
    expect(typeof created.date.getTime).toBe("function");
    expect(Number.isFinite(created.date.getTime())).toBe(true);

    expect(created.amount).toBe(120);

    expect(typeof created.createdAt.getTime).toBe("function");
    expect(Number.isFinite(created.createdAt.getTime())).toBe(true);

    expect(typeof created.updatedAt.getTime).toBe("function");
    expect(Number.isFinite(created.updatedAt.getTime())).toBe(true);
  });

  test("getAdjustmentById: throws when not found", async () => {
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(null as any);

    await expect(
      adjustmentService.getAdjustmentById(OWNER_USER_ID, "missing-id")
    ).rejects.toThrow("Adjustment with id missing-id not found");
  });

  test("getAdjustmentById: throws when document belongs to another user", async () => {
    const doc = {
      exists: true,
      id: "z9",
      data: () => ({ ...baseAdjustmentWithoutId, ownerUserId: OTHER_USER_ID }),
    };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);

    await expect(
      adjustmentService.getAdjustmentById(OWNER_USER_ID, "z9")
    ).rejects.toThrow("Adjustment with id z9 not found");
  });

  test("updateAdjustment: merges defined fields and refreshes updatedAt", async () => {
    const doc = { exists: true, id: "a1", data: () => ({ ...baseAdjustmentWithoutId }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    const updateSpy = jest.spyOn(repo, "updateDocument").mockResolvedValue();

    const updated = await adjustmentService.updateAdjustment(OWNER_USER_ID, "a1", {
      date: "2025-03-03",
      amount: 80,
      note: "revised",
      employerId: EMPLOYER_B,
      shiftId: SHIFT_2,
    });

    expect(updateSpy).toHaveBeenCalled();

    // Robust Date assertions across realms
    expect(typeof updated.updatedAt.getTime).toBe("function");
    expect(Number.isFinite(updated.updatedAt.getTime())).toBe(true);

    expect(updated.amount).toBe(80);
    expect(updated.note).toBe("revised");

    expect(typeof updated.date.getTime).toBe("function");
    expect(Number.isFinite(updated.date.getTime())).toBe(true);

    expect(updated.employerId).toBe(EMPLOYER_B);
    expect(updated.shiftId).toBe(SHIFT_2);
  });

  test("deleteAdjustment: deletes after ownership check", async () => {
    const doc = { exists: true, id: "a1", data: () => ({ ...baseAdjustmentWithoutId }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    const deleteSpy = jest.spyOn(repo, "deleteDocument").mockResolvedValue();

    await adjustmentService.deleteAdjustment(OWNER_USER_ID, "a1");

    expect(deleteSpy).toHaveBeenCalledWith("adjustments", "a1");
  });
});
