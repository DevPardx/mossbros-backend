import { client } from "../config/redis";
import logger from "./logger";

export class CacheService {
    static async get<T>(key: string): Promise<T | null> {
        try {
            const value = await client.get(key);
            if (!value) return null;

            return JSON.parse(value) as T;
        } catch (error) {
            logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    static async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            const serialized = JSON.stringify(value);

            if (ttl) {
                await client.setEx(key, ttl, serialized);
            } else {
                await client.set(key, serialized);
            }

            logger.debug(`Cache set for key ${key}${ttl ? ` with TTL ${ttl}s` : ""}`);
        } catch (error) {
            logger.error(`Cache set error for key ${key}:`, error);
        }
    }

    static async del(key: string): Promise<void> {
        try {
            await client.del(key);
            logger.debug(`Cache deleted for key ${key}`);
        } catch (error) {
            logger.error(`Cache delete error for key ${key}:`, error);
        }
    }

    static async delPattern(pattern: string): Promise<void> {
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                logger.debug(`Cache deleted ${keys.length} keys matching pattern ${pattern}`);
            }
        } catch (error) {
            logger.error(`Cache delete pattern error for ${pattern}:`, error);
        }
    }

    static async exists(key: string): Promise<boolean> {
        try {
            const result = await client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }

    static async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        try {
            const cached = await this.get<T>(key);
            if (cached !== null) {
                logger.debug(`Cache hit for key ${key}`);
                return cached;
            }

            logger.debug(`Cache miss for key ${key}`);
            const value = await fetchFn();

            await this.set(key, value, ttl);

            return value;
        } catch (error) {
            logger.error(`Cache getOrSet error for key ${key}:`, error);
            return await fetchFn();
        }
    }

    static async flush(): Promise<void> {
        try {
            await client.flushDb();
            logger.warn("Cache flushed (all keys deleted)");
        } catch (error) {
            logger.error("Cache flush error:", error);
        }
    }
}

export const CacheKeys = {
    brand: (id: string) => `brand:${id}`,
    brands: () => "brands:all",
    model: (id: string) => `model:${id}`,
    models: (brandId?: string) => brandId ? `models:brand:${brandId}` : "models:all",
    service: (id: string) => `service:${id}`,
    services: () => "services:all",
    customer: (id: string) => `customer:${id}`,
    repairJob: (id: string) => `repair_job:${id}`,
    statistics: () => "statistics:dashboard",
} as const;

export const CacheTTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 3600,          // 1 hour
    DAY: 86400,          // 24 hours
} as const;
