import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation";

// Mock express-validator
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

const mockedValidationResult = validationResult as jest.MockedFunction<
  typeof validationResult
>;

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("handleInputErrors", () => {
    it("should call next() when there are no validation errors", () => {
      mockedValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);

      handleInputErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it("should return 400 with errors when validation fails", () => {
      const errors = [
        {
          msg: "Email is required",
          param: "email",
          location: "body",
        },
        {
          msg: "Password must be at least 6 characters",
          param: "password",
          location: "body",
        },
      ];

      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      } as any);

      handleInputErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ errors });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return all validation errors in array format", () => {
      const errors = [
        {
          msg: "Name is required",
          param: "name",
          location: "body",
        },
      ];

      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      } as any);

      handleInputErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith({ errors });
      expect(Array.isArray(errors)).toBe(true);
    });

    it("should not proceed to next middleware when errors exist", () => {
      const errors = [
        {
          msg: "Invalid input",
          param: "field",
          location: "body",
        },
      ];

      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      } as any);

      handleInputErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle multiple validation errors", () => {
      const errors = [
        { msg: "Error 1", param: "field1", location: "body" },
        { msg: "Error 2", param: "field2", location: "body" },
        { msg: "Error 3", param: "field3", location: "body" },
      ];

      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      } as any);

      handleInputErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ errors });
      expect(errors.length).toBe(3);
    });

    it("should return errors in the correct structure", () => {
      const errors = [
        {
          msg: "Field is required",
          param: "testField",
          location: "body",
        },
      ];

      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      } as any);

      handleInputErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const [[responseBody]] = jsonMock.mock.calls;
      expect(responseBody).toHaveProperty("errors");
      expect(responseBody.errors).toEqual(errors);
    });
  });
});
