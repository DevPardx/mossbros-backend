// TypeORM configuration for production CLI usage
// This file is used when running migration commands in production
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB || "mossbros",

    synchronize: false, // Never auto-sync in production

    logging: ["error", "warn", "migration"],

    entities: [
        isProduction
            ? "dist/entities/**/*.entity.js"
            : "src/entities/**/*.entity.ts"
    ],

    migrations: [
        isProduction
            ? "dist/migrations/**/*.js"
            : "src/migrations/**/*.ts"
    ],

    migrationsTableName: "migrations_history",

    cli: {
        migrationsDir: "src/migrations"
    }
};
