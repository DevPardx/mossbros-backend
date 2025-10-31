import { DataSource } from "typeorm";
import { env } from "./env";

const isProduction = env.NODE_ENV === "production";
const isDevelopment = env.NODE_ENV === "development";

export const AppDataSource = new DataSource({
    type: "postgres",
    port: +env.POSTGRES_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    host: env.POSTGRES_HOST,

    synchronize: isDevelopment,

    logging: isDevelopment ? ["error", "warn", "migration"] : ["error"],

    entities: [__dirname + "/../entities/**/*.entity.{ts,js}"],

    migrations: [__dirname + "/../migrations/**/*.{ts,js}"],
    migrationsRun: isProduction,
    migrationsTableName: "migrations_history",

    ...(isProduction && {
        extra: {
            max: 20,
            min: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        }
    })
});