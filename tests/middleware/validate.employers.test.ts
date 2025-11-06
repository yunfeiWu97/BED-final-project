import { Request, Response, NextFunction } from "express";
import { validateRequest } from "../../src/api/v1/middleware/validate";
import { employerSchemas } from "../../src/api/v1/validations/employerValidation";
import { HTTP_STATUS } from "../../src/constants/httpConstants";

describe("Validation Middleware (Employers)", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("create: passes on valid input and strips unknown fields", () => {
    mockReq.body = {
      name: "RRC",
      hourlyRate: 20,
      extra: "should be stripped",
    };
    const mw = validateRequest(employerSchemas.create);

    mw(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect((mockReq.body as any).extra).toBeUndefined();
  });

  it("create: returns 400 when required fields are missing", () => {
    mockReq.body = { name: "" };
    const mw = validateRequest(employerSchemas.create);

    mw(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Validation error"),
      })
    );
  });

  it("paramsWithId: returns 400 when id is missing", () => {
    mockReq.params = {};
    const mw = validateRequest(employerSchemas.paramsWithId);

    mw(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
  });
});
