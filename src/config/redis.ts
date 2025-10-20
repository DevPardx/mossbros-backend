import { createClient } from "redis";

export const client = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT
    },
    password: process.env.REDIS_PASSWORD
});

client.on("error", (err) => console.error("Redis Client Error", err));