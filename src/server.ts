import express from "express";
import "dotenv/config";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createAuthRoutes } from "./routes/auth";
import { createBrandRoutes } from "./routes/brands";
import { createModelRoutes } from "./routes/models";
import { createCustomerRoutes } from "./routes/customers";
import { createServiceRoutes } from "./routes/services";
import { createRepairJobRoutes } from "./routes/repairJobs";
import { AppDataSource } from "./config/typeorm";
import { errorHandler } from "./middleware/error";
import { runAllSeeds } from "./database/seeds";
import { corsConfig } from "./config/cors";
import { ServiceContainer } from "./services/ServiceContainer";

const app = express();

let serviceContainer: ServiceContainer;

const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log(colors.magenta.bold("Database connected successfully"));

    serviceContainer = new ServiceContainer(AppDataSource);

    if (process.env.NODE_ENV === "development") {
      console.log(colors.cyan.bold("Running database seeds..."));
      await runAllSeeds();
      console.log(colors.green.bold("Database seeding completed"));
    } else {
      console.log(colors.yellow.bold("Skipping seeds in non-development environment"));
    }

    setupRoutes();
  } catch (error) {
    console.error(colors.red.bold("Error connecting to the database"), error);
    process.exit(1);
  }
};

const setupRoutes = () => {
  app.use("/api/v1/auth", createAuthRoutes(serviceContainer));
  app.use("/api/v1/brands", createBrandRoutes(serviceContainer));
  app.use("/api/v1/models", createModelRoutes(serviceContainer));
  app.use("/api/v1/customers", createCustomerRoutes(serviceContainer));
  app.use("/api/v1/services", createServiceRoutes(serviceContainer));
  app.use("/api/v1/repair-jobs", createRepairJobRoutes(serviceContainer));
};

connectDB();

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.use(cors(corsConfig));

app.use(errorHandler);

export default app;