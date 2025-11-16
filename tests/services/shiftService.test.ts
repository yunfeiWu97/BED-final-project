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

  it("getAllShifts: returns only current user's shifts; optional filter by employerId", async () => {
    // Arrange
    const shiftDocs = [
      { id: "s1", data: () => ({ ...baseShiftWithoutId }) },
      { id: "s2", data: () => ({ ...baseShiftWithoutId, employerId: EMPLOYER_B }) },
      { id: "s3", data: () => ({ ...baseShiftWithoutId, ownerUserId: OTHER_USER_ID }) },
    ];

    // getDocuments is used for "shifts" and "adjustments"
    jest
      .spyOn(repo, "getDocuments")
      .mockImplementation(async (collectionName: string) => {
        if (collectionName === "shifts") return { docs: shiftDocs } as any;
        if (collectionName === "adjustments") return { docs: [] } as any;
        return { docs: [] } as any;
      });

    // getDocumentById is used by getEmployerHourlyRate("employers", employerId)
    jest
      .spyOn(repo, "getDocumentById")
      .mockImplementation(async (collectionName: string, id: string) => {
        if (collectionName === "employers") {
          return {
            exists: true,
            id,
            data: () => ({ hourlyRate: 20 }), // simple fixed rate for test
          } as any;
        }
        return null as any;
      });

    // Act
    const filteredByEmployer = await shiftService.getAllShifts(OWNER_USER_ID, {
      employerId: EMPLOYER_A,
    });
    const allOwned = await shiftService.getAllShifts(OWNER_USER_ID);

    // Assert
    expect(filteredByEmployer.items.map((s) => s.id)).toEqual(["s1"]);
    expect(typeof filteredByEmployer.items[0].startTime.getTime).toBe("function");
    expect(Number.isFinite(filteredByEmployer.items[0].startTime.getTime())).toBe(true);

    expect(allOwned.items.map((s) => s.id)).toEqual(["s1", "s2"]);
  });

  it("getAllShifts: includeTotals aggregates hours by day and by month (totals are {hours, pay})", async () => {
    // Arrange
    const shiftDocs = [
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
      // Feb 2: 2h, different employer
      {
        id: "s3",
        data: () => ({
          ...baseShiftWithoutId,
          employerId: EMPLOYER_B,
          startTime: new Date("2025-02-02T12:00:00Z"),
          endTime: new Date("2025-02-02T14:00:00Z"),
        }),
      },
      // Excluded: belongs to other user
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

    jest
      .spyOn(repo, "getDocuments")
      .mockImplementation(async (collectionName: string) => {
        if (collectionName === "shifts") return { docs: shiftDocs } as any;
        if (collectionName === "adjustments") return { docs: [] } as any;
        return { docs: [] } as any;
      });

    // Same reason: getEmployerHourlyRate reads employers via getDocumentById
    jest
      .spyOn(repo, "getDocumentById")
      .mockImplementation(async (collectionName: string, id: string) => {
        if (collectionName === "employers") {
          return {
            exists: true,
            id,
            data: () => ({ hourlyRate: 20 }),
          } as any;
        }
        return null as any;
      });

    // Act
    const { totals } = await shiftService.getAllShifts(OWNER_USER_ID, {
      includeTotals: true,
    });

    // Assert
    expect(totals).toBeDefined();
    // Daily buckets
    expect(totals!.byDay["2025-01-01"].hours).toBeCloseTo(12, 5); // 8 + 4
    expect(totals!.byDay["2025-02-02"].hours).toBeCloseTo(2, 5);
    // Monthly buckets
    expect(totals!.byMonth["2025-01"].hours).toBeCloseTo(12, 5);
    expect(totals!.byMonth["2025-02"].hours).toBeCloseTo(2, 5);
  });

  it("createShift: converts ISO strings to Date and returns id", async () => {
    // Arrange
    jest.spyOn(repo, "createDocument").mockResolvedValue("new-shift-id");

    // Act
    const created = await shiftService.createShift(OWNER_USER_ID, {
      employerId: EMPLOYER_A,
      startTime: "2025-03-05T09:00:00Z",
      endTime: "2025-03-05T17:30:00Z",
      tips: 5,
    });

    // Assert
    expect(created.id).toBe("new-shift-id");
    expect(created.ownerUserId).toBe(OWNER_USER_ID);
    expect(typeof created.startTime.getTime).toBe("function");
    expect(Number.isFinite(created.endTime.getTime())).toBe(true);
  });

  it("getShiftById: throws when not found", async () => {
    // Arrange
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(null as any);

    // Act + Assert
    await expect(
      shiftService.getShiftById(OWNER_USER_ID, "missing-id")
    ).rejects.toThrow("Shift with id missing-id not found");
  });

  it("getShiftById: throws when belongs to another user", async () => {
    // Arrange
    const documentSnapshot = {
      exists: true,
      id: "s2",
      data: () => ({ ...baseShiftWithoutId, ownerUserId: OTHER_USER_ID }),
    };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(documentSnapshot as any);

    // Act + Assert
    await expect(
      shiftService.getShiftById(OWNER_USER_ID, "s2")
    ).rejects.toThrow("Shift with id s2 not found");
  });

  it("updateShift: merges provided fields and updates updatedAt", async () => {
    // Arrange
    const documentSnapshot = { exists: true, id: "s1", data: () => ({ ...baseShiftWithoutId }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(documentSnapshot as any);
    const updateSpy = jest.spyOn(repo, "updateDocument").mockResolvedValue();

    // Act
    const updated = await shiftService.updateShift(OWNER_USER_ID, "s1", {
      startTime: "2025-01-01T10:00:00Z",
      tips: 20,
    });

    // Assert
    expect(updateSpy).toHaveBeenCalled();
    expect(Number.isFinite(updated.updatedAt.getTime())).toBe(true);
    expect(updated.tips).toBe(20);
    expect(updated.startTime.toISOString()).toBe("2025-01-01T10:00:00.000Z");
  });

  it("deleteShift: deletes after ownership check", async () => {
    // Arrange
    const documentSnapshot = { exists: true, id: "s1", data: () => ({ ...baseShiftWithoutId }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(documentSnapshot as any);
    const deleteSpy = jest.spyOn(repo, "deleteDocument").mockResolvedValue();

    // Act
    await shiftService.deleteShift(OWNER_USER_ID, "s1");

    // Assert
    expect(deleteSpy).toHaveBeenCalledWith("shifts", "s1");
  });
});
