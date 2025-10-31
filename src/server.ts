import express from "express";
import "dotenv/config";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import brandRoutes from "./routes/brands";
import modelRoutes from "./routes/models";
import customerRoutes from "./routes/customers";
import serviceRoutes from "./routes/services";
import repairJobRoutes from "./routes/repairJobs";
import { AppDataSource } from "./config/typeorm";
import { errorHandler } from "./middleware/error";
import { runAllSeeds } from "./database/seeds";
import { corsConfig } from "./config/cors";

const app = express();

const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log(colors.magenta.bold("Database connected successfully"));

    if (process.env.NODE_ENV === "development") {
      console.log(colors.cyan.bold("Running database seeds..."));
      await runAllSeeds();
      console.log(colors.green.bold("Database seeding completed"));
    } else {
      console.log(colors.yellow.bold("Skipping seeds in non-development environment"));
    }
  } catch (error) {
    console.error(colors.red.bold("Error connecting to the database"), error);
    process.exit(1);
  }
};

connectDB();

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.use(cors(corsConfig));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/models", modelRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/repair-jobs", repairJobRoutes);

app.use(errorHandler);

export default app;