import { CacheService, CacheKeys, CacheTTL } from "../../../utils/cache";
import * as redisModule from "../../../config/redis";

jest.mock("../../../config/redis", () => ({
  client: {
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    exists: jest.fn(),
    flushDb: jest.fn(),
  },
}));

const mockedClient = redisModule.client as jest.Mocked<typeof redisModule.client>;

describe("CacheService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("should return parsed value when cache hit", async () => {
      const key = "test:key";
      const value = { id: 1, name: "Test" };
      mockedClient.get.mockResolvedValue(JSON.stringify(value));

      const result = await CacheService.get(key);

      expect(result).toEqual(value);
      expect(mockedClient.get).toHaveBeenCalledWith(key);
    });

    it("should return null when cache miss", async () => {
      const key = "test:key";
      mockedClient.get.mockResolvedValue(null);

      const result = await CacheService.get(key);

      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      const key = "test:key";
      mockedClient.get.mockRejectedValue(new Error("Redis error"));

      const result = await CacheService.get(key);

      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should set value with TTL", async () => {
      const key = "test:key";
      const value = { id: 1, name: "Test" };
      const ttl = 60;

      await CacheService.set(key, value, ttl);

      expect(mockedClient.setEx).toHaveBeenCalledWith(
        key,
        ttl,
        JSON.stringify(value)
      );
    });

    it("should set value without TTL", async () => {
      const key = "test:key";
      const value = { id: 1, name: "Test" };

      await CacheService.set(key, value);

      expect(mockedClient.set).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it("should handle errors gracefully", async () => {
      const key = "test:key";
      const value = { id: 1, name: "Test" };
      mockedClient.set.mockRejectedValue(new Error("Redis error"));

      await expect(CacheService.set(key, value)).resolves.not.toThrow();
    });
  });

  describe("del", () => {
    it("should delete key", async () => {
      const key = "test:key";

      await CacheService.del(key);

      expect(mockedClient.del).toHaveBeenCalledWith(key);
    });

    it("should handle errors gracefully", async () => {
      const key = "test:key";
      mockedClient.del.mockRejectedValue(new Error("Redis error"));

      await expect(CacheService.del(key)).resolves.not.toThrow();
    });
  });

  describe("delPattern", () => {
    it("should delete keys matching pattern", async () => {
      const pattern = "test:*";
      const keys = ["test:1", "test:2", "test:3"];
      mockedClient.keys.mockResolvedValue(keys);

      await CacheService.delPattern(pattern);

      expect(mockedClient.keys).toHaveBeenCalledWith(pattern);
      expect(mockedClient.del).toHaveBeenCalledWith(keys);
    });

    it("should not delete when no keys match", async () => {
      const pattern = "test:*";
      mockedClient.keys.mockResolvedValue([]);

      await CacheService.delPattern(pattern);

      expect(mockedClient.keys).toHaveBeenCalledWith(pattern);
      expect(mockedClient.del).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const pattern = "test:*";
      mockedClient.keys.mockRejectedValue(new Error("Redis error"));

      await expect(CacheService.delPattern(pattern)).resolves.not.toThrow();
    });
  });

  describe("exists", () => {
    it("should return true when key exists", async () => {
      const key = "test:key";
      mockedClient.exists.mockResolvedValue(1);

      const result = await CacheService.exists(key);

      expect(result).toBe(true);
      expect(mockedClient.exists).toHaveBeenCalledWith(key);
    });

    it("should return false when key does not exist", async () => {
      const key = "test:key";
      mockedClient.exists.mockResolvedValue(0);

      const result = await CacheService.exists(key);

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      const key = "test:key";
      mockedClient.exists.mockRejectedValue(new Error("Redis error"));

      const result = await CacheService.exists(key);

      expect(result).toBe(false);
    });
  });

  describe("getOrSet", () => {
    it("should return cached value on cache hit", async () => {
      const key = "test:key";
      const value = { id: 1, name: "Test" };
      mockedClient.get.mockResolvedValue(JSON.stringify(value));

      const fetchFn = jest.fn();
      const result = await CacheService.getOrSet(key, fetchFn);

      expect(result).toEqual(value);
      expect(fetchFn).not.toHaveBeenCalled();
      expect(mockedClient.get).toHaveBeenCalledWith(key);
    });

    it("should fetch and cache value on cache miss", async () => {
      const key = "test:key";
      const value = { id: 1, name: "Test" };
      const ttl = 60;
      mockedClient.get.mockResolvedValue(null);

      const fetchFn = jest.fn().mockResolvedValue(value);
      const result = await CacheService.getOrSet(key, fetchFn, ttl);

      expect(result).toEqual(value);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(mockedClient.setEx).toHaveBeenCalledWith(
        key,
        ttl,
        JSON.stringify(value)
      );
    });

    it("should fetch value on error", async () => {
      const key = "test:key";
      const value = { id: 1, name: "Test" };
      mockedClient.get.mockRejectedValue(new Error("Redis error"));

      const fetchFn = jest.fn().mockResolvedValue(value);
      const result = await CacheService.getOrSet(key, fetchFn);

      expect(result).toEqual(value);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("flush", () => {
    it("should flush all keys", async () => {
      await CacheService.flush();

      expect(mockedClient.flushDb).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockedClient.flushDb.mockRejectedValue(new Error("Redis error"));

      await expect(CacheService.flush()).resolves.not.toThrow();
    });
  });
});

describe("CacheKeys", () => {
  it("should generate correct brand key", () => {
    expect(CacheKeys.brand("123")).toBe("brand:123");
  });

  it("should generate correct brands key", () => {
    expect(CacheKeys.brands()).toBe("brands:all");
  });

  it("should generate correct model key", () => {
    expect(CacheKeys.model("456")).toBe("model:456");
  });

  it("should generate correct models key with brandId", () => {
    expect(CacheKeys.models("123")).toBe("models:brand:123");
  });

  it("should generate correct models key without brandId", () => {
    expect(CacheKeys.models()).toBe("models:all");
  });

  it("should generate correct service key", () => {
    expect(CacheKeys.service("789")).toBe("service:789");
  });

  it("should generate correct services key", () => {
    expect(CacheKeys.services()).toBe("services:all");
  });
});

describe("CacheTTL", () => {
  it("should have correct TTL values", () => {
    expect(CacheTTL.SHORT).toBe(60);
    expect(CacheTTL.MEDIUM).toBe(300);
    expect(CacheTTL.LONG).toBe(3600);
    expect(CacheTTL.DAY).toBe(86400);
  });
});
