import { Request, Response, NextFunction } from "express";
import { validateRequest } from "../../src/api/v1/middleware/validate";
import { employerSchemas } from "../../src/api/v1/validations/employerValidation";
import { HTTP_STATUS } from "../../src/constants/httpConstants";

describe("Validation Middleware (Employers)", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Arrange
    mockRequest = { body: {}, params: {}, query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("create: passes on valid input and strips unknown fields", () => {
    // Arrange
    mockRequest.body = {
      name: "RRC",
      hourlyRate: 20,
      extra: "should be stripped",
    };
    const validationMiddleware = validateRequest(employerSchemas.create);

    // Act
    validationMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect((mockRequest.body as any).extra).toBeUndefined();
  });

  it("create: returns 400 with structured error object when required fields are missing", () => {
    // Arrange
    mockRequest.body = { name: "" }; // missing hourlyRate, empty name
    const validationMiddleware = validateRequest(employerSchemas.create);

    // Act
    validationMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
          message: expect.any(String),
          details: expect.any(Array),
        }),
        timestamp: expect.any(String),
      })
    );
  });

  it("paramsWithId: returns 400 when id is missing", () => {
    // Arrange
    mockRequest.params = {};
    const validationMiddleware = validateRequest(
      employerSchemas.paramsWithId
    );

    // Act
    validationMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
        }),
      })
    );
  });
});
