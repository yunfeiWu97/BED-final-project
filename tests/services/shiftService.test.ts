// tests/services/shiftService.test.ts
import * as shiftService from "../../src/api/v1/services/shiftService";
import * as repo from "../../src/api/v1/repositories/firestoreRepository";
import { Shift } from "../../src/api/v1/models/shiftModel";

const OWNER_USER_ID = "demo-user";
const OTHER_USER_ID = "someone-else";
const EMPLOYER_A = "employee-a";
const EMPLOYER_B = "employee-b";

const baseShiftWithoutId: Omit<Shift, "id"> = {
  ownerUserId: OWNER_USER_ID,
  employerId: EMPLOYER_A,
  startTime: new Date("2025-01-01T09:00:00Z"),
  endTime: new Date("2025-01-01T17:00:00Z"),
  tips: 10,
  createdAt: new Date("2025-01-01T17:00:00Z"),
  updatedAt: new Date("2025-01-01T17:00:00Z"),
};

describe("shiftService", () => {
  afterEach(() => jest.clearAllMocks());

  test("getAllShifts: returns only current user's shifts; optional filter by employerId", async () => {
    const documents = [
      { id: "s1", data: () => ({ ...baseShiftWithoutId }) },
      { id: "s2", data: () => ({ ...baseShiftWithoutId, employerId: EMPLOYER_B }) },
      { id: "s3", data: () => ({ ...baseShiftWithoutId, ownerUserId: OTHER_USER_ID }) },
    ];
    jest.spyOn(repo, "getDocuments").mockResolvedValue({ docs: documents } as any);

    const resultA = await shiftService.getAllShifts(OWNER_USER_ID, { employerId: EMPLOYER_A });
    expect(resultA.items.map(s => s.id)).toEqual(["s1"]);
    expect(typeof resultA.items[0].startTime.getTime).toBe("function");
    expect(Number.isFinite(resultA.items[0].startTime.getTime())).toBe(true);

    const resultAll = await shiftService.getAllShifts(OWNER_USER_ID);
    expect(resultAll.items.map(s => s.id)).toEqual(["s1", "s2"]);
  });

  test("getAllShifts: includeTotals aggregates hours by day and by month", async () => {
    const docs = [
      // Jan 1: 8h
      { id: "s1", data: () => ({ ...baseShiftWithoutId }) },
      // Jan 1: 4h
      {
        id: "s2",
        data: () => ({
          ...baseShiftWithoutId,
          startTime: new Date("2025-01-01T18:00:00Z"),
          endTime: new Date("2025-01-01T22:00:00Z"),
        }),
      },
      // Feb 2: 2h, other employer but same owner
      {
        id: "s3",
        data: () => ({
          ...baseShiftWithoutId,
          employerId: EMPLOYER_B,
          startTime: new Date("2025-02-02T12:00:00Z"),
          endTime: new Date("2025-02-02T14:00:00Z"),
        }),
      },
      // belongs to other user, should be excluded
      {
        id: "sX",
        data: () => ({
          ...baseShiftWithoutId,
          ownerUserId: OTHER_USER_ID,
          startTime: new Date("2025-01-01T09:00:00Z"),
          endTime: new Date("2025-01-01T10:00:00Z"),
        }),
      },
    ];
    jest.spyOn(repo, "getDocuments").mockResolvedValue({ docs } as any);

    const { totals } = await shiftService.getAllShifts(OWNER_USER_ID, { includeTotals: true });
    expect(totals).toBeDefined();
    expect(totals!.byDay["2025-01-01"]).toBeCloseTo(12, 5); // 8 + 4
    expect(totals!.byDay["2025-02-02"]).toBeCloseTo(2, 5);
    expect(totals!.byMonth["2025-01"]).toBeCloseTo(12, 5);
    expect(totals!.byMonth["2025-02"]).toBeCloseTo(2, 5);
  });

  test("createShift: converts ISO strings to Date and returns id", async () => {
    jest.spyOn(repo, "createDocument").mockResolvedValue("new-shift-id");

    const created = await shiftService.createShift(OWNER_USER_ID, {
      employerId: EMPLOYER_A,
      startTime: "2025-03-05T09:00:00Z",
      endTime: "2025-03-05T17:30:00Z",
      tips: 5,
    });

    expect(created.id).toBe("new-shift-id");
    expect(created.ownerUserId).toBe(OWNER_USER_ID);
    expect(typeof created.startTime.getTime).toBe("function");
    expect(Number.isFinite(created.endTime.getTime())).toBe(true);
  });

  test("getShiftById: throws when not found", async () => {
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(null as any);
    await expect(
      shiftService.getShiftById(OWNER_USER_ID, "missing-id")
    ).rejects.toThrow("Shift with id missing-id not found");
  });

  test("getShiftById: throws when belongs to another user", async () => {
    const doc = {
      exists: true,
      id: "s2",
      data: () => ({ ...baseShiftWithoutId, ownerUserId: OTHER_USER_ID }),
    };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    await expect(
      shiftService.getShiftById(OWNER_USER_ID, "s2")
    ).rejects.toThrow("Shift with id s2 not found");
  });

  test("updateShift: merges provided fields and updates updatedAt", async () => {
    const doc = { exists: true, id: "s1", data: () => ({ ...baseShiftWithoutId }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    const updateSpy = jest.spyOn(repo, "updateDocument").mockResolvedValue();

    const updated = await shiftService.updateShift(OWNER_USER_ID, "s1", {
      startTime: "2025-01-01T10:00:00Z",
      tips: 20,
    });

    expect(updateSpy).toHaveBeenCalled();
    expect(Number.isFinite(updated.updatedAt.getTime())).toBe(true);
    expect(updated.tips).toBe(20);
    expect(updated.startTime.toISOString()).toBe("2025-01-01T10:00:00.000Z");
  });

  test("deleteShift: deletes after ownership check", async () => {
    const doc = { exists: true, id: "s1", data: () => ({ ...baseShiftWithoutId }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    const deleteSpy = jest.spyOn(repo, "deleteDocument").mockResolvedValue();

    await shiftService.deleteShift(OWNER_USER_ID, "s1");
    expect(deleteSpy).toHaveBeenCalledWith("shifts", "s1");
  });
});
