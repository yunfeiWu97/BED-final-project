// tests/services/employerService.test.ts
import * as employerService from "../../src/api/v1/services/employerService";
import * as firestoreRepository from "../../src/api/v1/repositories/firestoreRepository";
import { Employer } from "../../src/api/v1/models/employerModel";

const OWNER_USER_ID = "demo-user";
const OTHER_USER_ID = "someone-else";

const baseEmployerWithoutId: Omit<Employer, "id"> = {
  ownerUserId: OWNER_USER_ID,
  name: "RRC",
  hourlyRate: 20,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

describe("employerService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAllEmployers: returns only the current user's employers", async () => {
    const documents = [
      { id: "a1", data: () => ({ ...baseEmployerWithoutId }) },
      {
        id: "b2",
        data: () => ({ ...baseEmployerWithoutId, ownerUserId: OTHER_USER_ID }),
      },
    ];
    jest
      .spyOn(firestoreRepository, "getDocuments")
      .mockResolvedValue({ docs: documents } as any);

    const result = await employerService.getAllEmployers(OWNER_USER_ID);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1");
    expect(result[0].ownerUserId).toBe(OWNER_USER_ID);

    // Robust Date assertions (avoid cross-realm instanceof issues)
    expect(typeof result[0].createdAt.getTime).toBe("function");
    expect(Number.isFinite(result[0].createdAt.getTime())).toBe(true);
    expect(typeof result[0].updatedAt.getTime).toBe("function");
    expect(Number.isFinite(result[0].updatedAt.getTime())).toBe(true);
  });

  test("createEmployer: creates and returns an employer with an id", async () => {
    jest
      .spyOn(firestoreRepository, "createDocument")
      .mockResolvedValue("new-id");

    const createdEmployer = await employerService.createEmployer(
      OWNER_USER_ID,
      { name: "RRC", hourlyRate: 20 }
    );

    expect(createdEmployer.id).toBe("new-id");
    expect(createdEmployer.ownerUserId).toBe(OWNER_USER_ID);
    expect(createdEmployer.name).toBe("RRC");
    expect(createdEmployer.hourlyRate).toBe(20);

    expect(typeof createdEmployer.createdAt.getTime).toBe("function");
    expect(Number.isFinite(createdEmployer.createdAt.getTime())).toBe(true);
    expect(typeof createdEmployer.updatedAt.getTime).toBe("function");
    expect(Number.isFinite(createdEmployer.updatedAt.getTime())).toBe(true);
  });

  test("getEmployerById: throws when the document is not found", async () => {
    jest
      .spyOn(firestoreRepository, "getDocumentById")
      .mockResolvedValue(null as any);

    await expect(
      employerService.getEmployerById(OWNER_USER_ID, "missing-id")
    ).rejects.toThrow("Employer with id missing-id not found");
  });

  test("getEmployerById: throws when the document belongs to another user", async () => {
    const documentSnapshot = {
      exists: true,
      id: "b2",
      data: () => ({ ...baseEmployerWithoutId, ownerUserId: OTHER_USER_ID }),
    };
    jest
      .spyOn(firestoreRepository, "getDocumentById")
      .mockResolvedValue(documentSnapshot as any);

    await expect(
      employerService.getEmployerById(OWNER_USER_ID, "b2")
    ).rejects.toThrow("Employer with id b2 not found");
  });

  test("updateEmployer: merges changes and returns the updated employer", async () => {
    const documentSnapshot = {
      exists: true,
      id: "a1",
      data: () => ({ ...baseEmployerWithoutId }),
    };
    jest
      .spyOn(firestoreRepository, "getDocumentById")
      .mockResolvedValue(documentSnapshot as any);
    const updateDocumentSpy = jest
      .spyOn(firestoreRepository, "updateDocument")
      .mockResolvedValue();

    const updatedEmployer = await employerService.updateEmployer(
      OWNER_USER_ID,
      "a1",
      { name: "RRC Polytech" }
    );

    expect(updateDocumentSpy).toHaveBeenCalledWith(
      "employers",
      "a1",
      expect.objectContaining({ name: "RRC Polytech" })
    );
    expect(updatedEmployer.id).toBe("a1");
    expect(updatedEmployer.name).toBe("RRC Polytech");
    expect(typeof updatedEmployer.updatedAt.getTime).toBe("function");
    expect(Number.isFinite(updatedEmployer.updatedAt.getTime())).toBe(true);
  });

  test("deleteEmployer: deletes the employer that belongs to the current user", async () => {
    const documentSnapshot = {
      exists: true,
      id: "a1",
      data: () => ({ ...baseEmployerWithoutId }),
    };
    jest
      .spyOn(firestoreRepository, "getDocumentById")
      .mockResolvedValue(documentSnapshot as any);
    const deleteDocumentSpy = jest
      .spyOn(firestoreRepository, "deleteDocument")
      .mockResolvedValue();

    await employerService.deleteEmployer(OWNER_USER_ID, "a1");

    expect(deleteDocumentSpy).toHaveBeenCalledWith("employers", "a1");
  });
});
