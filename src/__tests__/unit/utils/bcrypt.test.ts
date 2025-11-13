import { hashPassword, comparePassword } from "../../../utils/bcrypt";
import bcrypt from "bcrypt";

jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("Bcrypt Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "mySecurePassword123";
      const hashedPassword = "$2b$10$hashedPassword";

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(mockedBcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it("should throw error when bcrypt.hash fails", async () => {
      const password = "mySecurePassword123";
      const error = new Error("Hashing failed");

      mockedBcrypt.hash.mockRejectedValue(error as never);

      await expect(hashPassword(password)).rejects.toThrow("Hashing failed");
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching passwords", async () => {
      const password = "mySecurePassword123";
      const hashedPassword = "$2b$10$hashedPassword";

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await comparePassword(password, hashedPassword);

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it("should return false for non-matching passwords", async () => {
      const password = "wrongPassword";
      const hashedPassword = "$2b$10$hashedPassword";

      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await comparePassword(password, hashedPassword);

      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it("should throw error when bcrypt.compare fails", async () => {
      const password = "mySecurePassword123";
      const hashedPassword = "$2b$10$hashedPassword";
      const error = new Error("Comparison failed");

      mockedBcrypt.compare.mockRejectedValue(error as never);

      await expect(comparePassword(password, hashedPassword)).rejects.toThrow(
        "Comparison failed"
      );
    });
  });
});
