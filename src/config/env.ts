import "dotenv/config";
import logger from "../utils/logger";

interface EnvConfig {
    POSTGRES_DB: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;

    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_PASSWORD: string;

    NODE_ENV: string;
    PORT: string;
    FRONTEND_URL: string;

    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;

    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;

    OWNER_NAME: string;
    OWNER_EMAIL: string;
    OWNER_PASSWORD: string;
    OWNER_PHONE: string;
}

const requiredEnvVars: (keyof EnvConfig)[] = [
    "POSTGRES_DB",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_HOST",
    "POSTGRES_PORT",

    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_PASSWORD",

    "NODE_ENV",
    "PORT",
    "FRONTEND_URL",

    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",

    "JWT_SECRET",
    "JWT_REFRESH_SECRET",

    "OWNER_NAME",
    "OWNER_EMAIL",
    "OWNER_PASSWORD",
    "OWNER_PHONE",
];

export function validateEnv(): void {
    const missing: string[] = [];
    const warnings: string[] = [];

    for (const envVar of requiredEnvVars) {
        if (process.env.NODE_ENV === "production" && envVar.startsWith("OWNER_")) {
            continue;
        }

        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (process.env.NODE_ENV === "production") {
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
            warnings.push("JWT_SECRET should be at least 32 characters in production");
        }

        if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
            warnings.push("JWT_REFRESH_SECRET should be at least 32 characters in production");
        }

        if (process.env.POSTGRES_PASSWORD === "password") {
            warnings.push("POSTGRES_PASSWORD appears to be a default value");
        }

        if (process.env.REDIS_PASSWORD === "password") {
            warnings.push("REDIS_PASSWORD appears to be a default value");
        }
    }

    if (missing.length > 0) {
        logger.error("Missing required environment variables:");
        missing.forEach(envVar => {
            logger.error(`   - ${envVar}`);
        });
        logger.error("Please create a .env file based on .env.example");
        process.exit(1);
    }

    if (warnings.length > 0) {
        logger.warn("Environment configuration warnings:");
        warnings.forEach(warning => {
            logger.warn(`   - ${warning}`);
        });
    }

    logger.info("Environment variables validated successfully");
}

export const env: EnvConfig = {
    POSTGRES_DB: process.env.POSTGRES_DB!,
    POSTGRES_USER: process.env.POSTGRES_USER!,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
    POSTGRES_HOST: process.env.POSTGRES_HOST!,
    POSTGRES_PORT: process.env.POSTGRES_PORT!,

    REDIS_HOST: process.env.REDIS_HOST!,
    REDIS_PORT: process.env.REDIS_PORT!,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD!,

    NODE_ENV: process.env.NODE_ENV!,
    PORT: process.env.PORT!,
    FRONTEND_URL: process.env.FRONTEND_URL!,

    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: process.env.SMTP_PORT!,
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,

    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

    OWNER_NAME: process.env.OWNER_NAME!,
    OWNER_EMAIL: process.env.OWNER_EMAIL!,
    OWNER_PASSWORD: process.env.OWNER_PASSWORD!,
    OWNER_PHONE: process.env.OWNER_PHONE!,
};
