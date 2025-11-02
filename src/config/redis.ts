import { createClient } from "redis";
import { env } from "./env";
import logger from "../utils/logger";

export const client = createClient({
    socket: {
        host: env.REDIS_HOST,
        port: +env.REDIS_PORT
    },
    password: env.REDIS_PASSWORD
});

client.on("error", (err) => logger.error("Redis Client Error", err));
client.on("connect", () => logger.info("Redis connected successfully"));
client.on("disconnect", () => logger.warn("Redis disconnected"));