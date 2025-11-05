import * as employerService from "../../src/api/v1/services/employerService";
import * as repo from "../../src/api/v1/repositories/firestoreRepository";
import { Employer } from "../../src/api/v1/models/employerModel";

const OWNER = "demo-user";
const OTHER = "someone-else";

const baseEmployer: Omit<Employer, "id"> = {
  ownerUserId: OWNER,
  name: "RRC",
  hourlyRate: 20,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

describe("employerService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAllEmployers: returns only current user's employers", async () => {
    // Arrange
    const docs = [
      { id: "a1", data: () => ({ ...baseEmployer }) },
      { id: "b2", data: () => ({ ...baseEmployer, ownerUserId: OTHER }) },
    ];
    jest.spyOn(repo, "getDocuments").mockResolvedValue({ docs } as any);

    // Act
    const result = await employerService.getAllEmployers(OWNER);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1");
    expect(result[0].ownerUserId).toBe(OWNER);
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].updatedAt).toBeInstanceOf(Date);
  });

  test("createEmployer: creates and returns object with id", async () => {
    // Arrange
    jest.spyOn(repo, "createDocument").mockResolvedValue("new-id");

    // Act
    const created = await employerService.createEmployer(OWNER, {
      name: "RRC",
      hourlyRate: 20,
    });

    // Assert
    expect(created.id).toBe("new-id");
    expect(created.ownerUserId).toBe(OWNER);
    expect(created.name).toBe("RRC");
    expect(created.hourlyRate).toBe(20);
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);
  });

  test("getEmployerById: throws when document not found", async () => {
    // Arrange
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(null as any);

    // Act + Assert
    await expect(
      employerService.getEmployerById(OWNER, "missing-id")
    ).rejects.toThrow("Employer with id missing-id not found");
  });

  test("getEmployerById: throws when document belongs to another user", async () => {
    // Arrange
    const doc = {
      exists: true,
      id: "b2",
      data: () => ({ ...baseEmployer, ownerUserId: OTHER }),
    };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);

    // Act + Assert
    await expect(
      employerService.getEmployerById(OWNER, "b2")
    ).rejects.toThrow("Employer with id b2 not found");
  });

  test("updateEmployer: merges changes and returns updated object", async () => {
    // Arrange
    const doc = { exists: true, id: "a1", data: () => ({ ...baseEmployer }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    const updateSpy = jest.spyOn(repo, "updateDocument").mockResolvedValue();

    // Act
    const updated = await employerService.updateEmployer(OWNER, "a1", {
      name: "RRC Polytech",
    });

    // Assert
    expect(updateSpy).toHaveBeenCalledWith(
      "employers",
      "a1",
      expect.objectContaining({ name: "RRC Polytech" })
    );
    expect(updated.id).toBe("a1");
    expect(updated.name).toBe("RRC Polytech");
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  test("deleteEmployer: deletes employer that belongs to current user", async () => {
    // Arrange
    const doc = { exists: true, id: "a1", data: () => ({ ...baseEmployer }) };
    jest.spyOn(repo, "getDocumentById").mockResolvedValue(doc as any);
    const del = jest.spyOn(repo, "deleteDocument").mockResolvedValue();

    // Act
    await employerService.deleteEmployer(OWNER, "a1");

    // Assert
    expect(del).toHaveBeenCalledWith("employers", "a1");
  });
});
