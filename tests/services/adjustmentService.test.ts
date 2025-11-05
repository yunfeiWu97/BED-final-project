import * as adjustmentService from "../../src/api/v1/services/adjustmentService";
import * as repo from "../../src/api/v1/repositories/firestoreRepository";
import { Adjustment } from "../../src/api/v1/models/adjustmentModel";

// Mock the repository layer
jest.mock("../../src/api/v1/repositories/firestoreRepository");

const OWNER = "demo-user";
const OTHER = "someone-else";

const baseAdjustmentWithoutId: Omit<Adjustment, "id"> = {
  ownerUserId: OWNER,
  date: new Date("2025-01-01T00:00:00Z"),
  amount: 50,
  employerId: "emp-1",
  shiftId: "shift-1",
  note: "bonus",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

describe("adjustmentService", () => {
  afterEach(() => jest.clearAllMocks());

  test("getAllAdjustments: filters by owner; optional employerId/shiftId", async () => {
    const documents = [
      { id: "a1", data: () => ({ ...baseAdjustmentWithoutId }) },
      { id: "a2", data: () => ({ ...baseAdjustmentWithoutId, employerId: "emp-2" }) },
      { id: "a3", data: () => ({ ...baseAdjustmentWithoutId, shiftId: "shift-2" }) },
      { id: "bX", data: () => ({ ...baseAdjustmentWithoutId, ownerUserId: OTHER }) },
    ];
    jest.spyOn(repo, "getDocuments").mockResolvedValue({ docs: documents } as any);

    const allMine = await adjustmentService.getAllAdjustments(OWNER);
    expect(allMine.map(a => a.id)).toEqual(["a1", "a2", "a3"]);

    const onlyEmp1 = await adjustmentService.getAllAdjustments(OWNER, { employerId: "emp-1" });
    expect(onlyEmp1.map(a => a.id)).toEqual(["a1", "a3"]);

    const onlyShift1 = await adjustmentService.getAllAdjustments(OWNER, { shiftId: "shift-1" });
    expect(onlyShift1.map(a => a.id)).toEqual(["a1", "a2"]);
  });

  test("createAdjustment: converts date from ISO and returns id", async () => {
    jest.spyOn(repo, "createDocument").mockResolvedValue("new-adj-id");

    const created = await adjustmentService.createAdjustment(OWNER, {
      date: "2025-02-02",
      amount: 120,
      employerId: "emp-9",
      note: "allowance",
    });

    expect(created.id).toBe("new-adj-id");
    expect(created.ownerUserId).toBe(OWNER);
    expect(created.date).toBeInstanceOf(Date);
    expect(created.amount).toBe(120);
  });

  test("getAdjustmentById: throws when not found", async () => {
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(null as any);
    await expect(
      adjustmentService.getAdjustmentById(OWNER, "missing-id")
    ).rejects.toThrow("Adjustment with id missing-id not found");
  });

  test("getAdjustmentById: throws when owned by another user", async () => {
    const doc = {
      exists: true,
      id: "a2",
      data: () => ({ ...baseAdjustmentWithoutId, ownerUserId: OTHER }),
    };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);

    await expect(
      adjustmentService.getAdjustmentById(OWNER, "a2")
    ).rejects.toThrow("Adjustment with id a2 not found");
  });

  test("updateAdjustment: merges defined fields and refreshes updatedAt", async () => {
    const doc = { exists: true, id: "a1", data: () => ({ ...baseAdjustmentWithoutId }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    const updateSpy = jest.spyOn(repo, "updateDocument").mockResolvedValue();

    const updated = await adjustmentService.updateAdjustment(OWNER, "a1", {
      date: "2025-01-02",
      amount: 80,
      note: "revised",
    });

    expect(updateSpy).toHaveBeenCalled();
    expect(updated.updatedAt).toBeInstanceOf(Date);
    expect(updated.amount).toBe(80);
    expect(updated.note).toBe("revised");
    expect(updated.date).toBeInstanceOf(Date);
    expect(updated.date.toISOString().startsWith("2025-01-02")).toBe(true);
  });

  test("deleteAdjustment: deletes after ownership check", async () => {
    const doc = { exists: true, id: "a1", data: () => ({ ...baseAdjustmentWithoutId }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    const deleteSpy = jest.spyOn(repo, "deleteDocument").mockResolvedValue();

    await adjustmentService.deleteAdjustment(OWNER, "a1");
    expect(deleteSpy).toHaveBeenCalledWith("adjustments", "a1");
  });
});
