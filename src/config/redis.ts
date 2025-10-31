import { createClient } from "redis";
import { env } from "./env";

export const client = createClient({
    socket: {
        host: env.REDIS_HOST,
        port: +env.REDIS_PORT
    },
    password: env.REDIS_PASSWORD
});

client.on("error", (err) => console.error("Redis Client Error", err));