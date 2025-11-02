import express from "express";
import "dotenv/config";
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
import logger, { stream } from "./utils/logger";
import { createGeneralLimiter, createAuthLimiter, createPasswordResetLimiter } from "./middleware/rateLimiter";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import type { RateLimitRequestHandler } from "express-rate-limit";

const app = express();

let serviceContainer: ServiceContainer;
let generalLimiter: RateLimitRequestHandler | undefined;
let authLimiter: RateLimitRequestHandler | undefined;
let passwordResetLimiter: RateLimitRequestHandler | undefined;

const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully");

    serviceContainer = new ServiceContainer(AppDataSource);

    if (process.env.NODE_ENV === "development") {
      logger.info("Running database seeds...");
      await runAllSeeds();
      logger.info("Database seeding completed");
    } else {
      logger.warn("Skipping seeds in non-development environment");
    }

    setupRoutes();
  } catch (error) {
    logger.error("Error connecting to the database", error);
    process.exit(1);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initializeRateLimiters = (redisClient: any) => {
  generalLimiter = createGeneralLimiter(redisClient);
  authLimiter = createAuthLimiter(redisClient);
  passwordResetLimiter = createPasswordResetLimiter(redisClient);
  logger.info("Rate limiters initialized");
};

const setupRoutes = () => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "MossBros Taller API Docs",
  }));

  app.use("/api/v1/auth", createAuthRoutes(serviceContainer, authLimiter, passwordResetLimiter));
  app.use("/api/v1/brands", createBrandRoutes(serviceContainer));
  app.use("/api/v1/models", createModelRoutes(serviceContainer));
  app.use("/api/v1/customers", createCustomerRoutes(serviceContainer));
  app.use("/api/v1/services", createServiceRoutes(serviceContainer));
  app.use("/api/v1/repair-jobs", createRepairJobRoutes(serviceContainer));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  logger.info("API documentation available at /api-docs");
};

connectDB();

app.use(morgan("combined", { stream }));

app.use(express.json());

app.use(cookieParser());

app.use(cors(corsConfig));

// Apply general rate limiter if initialized
if (generalLimiter) {
  app.use(generalLimiter);
}

app.use(errorHandler);

export default app;