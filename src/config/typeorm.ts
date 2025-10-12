import { DataSource } from "typeorm";
import "dotenv/config";

export const AppDataSource = new DataSource({
    type: "postgres",
    port: +process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    synchronize: true,
    logging: false,
    entities: [__dirname + "/../entities/**/*.entity.ts"]
});