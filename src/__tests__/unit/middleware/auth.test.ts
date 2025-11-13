import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate, verifyJwtCookie } from "../../../middleware/auth";
import { AppDataSource } from "../../../config/typeorm";
import { User } from "../../../entities";
import {
  UnauthorizedError,
  BadRequestError,
} from "../../../handler/error.handler";
import { UserRole } from "../../../enums";

jest.mock("jsonwebtoken");
jest.mock("../../../config/typeorm", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedAppDataSource = AppDataSource as jest.Mocked<typeof AppDataSource>;

describe("Authentication Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockUserRepository: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      cookies: {},
    };
    mockResponse = {};
    mockNext = jest.fn();

    mockUserRepository = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
    };

    mockedAppDataSource.getRepository.mockReturnValue(mockUserRepository);
    jest.clearAllMocks();
  });

  describe("verifyJwtCookie", () => {
    it("should verify valid JWT from cookie and attach user", async () => {
      const mockUser: Partial<User> = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.OWNER,
      };

      mockRequest.cookies = { token: "valid-token" };
      mockedJwt.verify.mockReturnValue({ id: "user-123" } as any);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      await verifyJwtCookie(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token",
        process.env.JWT_SECRET
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: "user-123",
      });
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw BadRequestError when no token provided", async () => {
      mockRequest.cookies = {};

      await expect(
        verifyJwtCookie(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow(BadRequestError);
      await expect(
        verifyJwtCookie(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow("No token provided");
    });

    it("should throw BadRequestError when user not found", async () => {
      mockRequest.cookies = { token: "valid-token" };
      mockedJwt.verify.mockReturnValue({ id: "user-123" } as any);
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(
        verifyJwtCookie(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow(BadRequestError);
      await expect(
        verifyJwtCookie(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow("User not found");
    });

    it("should throw BadRequestError when token verification fails", async () => {
      mockRequest.cookies = { token: "invalid-token" };
      mockedJwt.verify.mockImplementation(() => {
        throw new Error("Token expired");
      });

      await expect(
        verifyJwtCookie(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("authenticate", () => {
    it("should verify valid Bearer token and attach user", async () => {
      const mockUser: Partial<User> = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: UserRole.OWNER,
      };

      mockRequest.headers = { authorization: "Bearer valid-token" };
      mockedJwt.verify.mockReturnValue({ id: "user-123" } as any);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token",
        process.env.JWT_SECRET
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: ["id", "email", "role", "phone", "name"],
      });
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when no authorization header", async () => {
      mockRequest.headers = {};

      await expect(
        authenticate(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        authenticate(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow("Not Authorized");
    });

    it("should throw UnauthorizedError when token is missing from Bearer", async () => {
      mockRequest.headers = { authorization: "Bearer " };

      await expect(
        authenticate(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        authenticate(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow("Invalid token");
    });

    it("should throw UnauthorizedError when token verification fails", async () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" };
      mockedJwt.verify.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      await expect(
        authenticate(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        authenticate(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow("Not Authorized");
    });

    it("should set user to undefined when user not found in database", async () => {
      mockRequest.headers = { authorization: "Bearer valid-token" };
      mockedJwt.verify.mockReturnValue({ id: "user-123" } as any);
      mockUserRepository.findOne.mockResolvedValue(null);

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle decoded token without id property", async () => {
      mockRequest.headers = { authorization: "Bearer valid-token" };
      mockedJwt.verify.mockReturnValue({ sub: "user-123" } as any);

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
