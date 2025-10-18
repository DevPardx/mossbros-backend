import express from "express";
import "dotenv/config";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./config/typeorm";
import authRoutes from "./routes/auth";
import { errorHandler } from "./middleware/error";
import { runAllSeeds } from "./database/seeds";
import { corsConfig } from "./config/cors";

const app = express();

const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log(colors.magenta.bold("Database connected successfully"));
    await runAllSeeds();
  } catch (error) {
    console.error(colors.red.bold("Error connecting to the database"), error);
  }
};

connectDB();

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.use(cors(corsConfig));

app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;