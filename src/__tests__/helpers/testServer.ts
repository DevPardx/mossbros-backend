import express, { Express } from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "../../middleware/error";

/**
 * Creates a minimal Express app for testing routes
 */
export const createTestServer = (router: express.Router): Express => {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Mount router
  app.use("/api", router);

  // Error handling
  app.use(errorHandler);

  return app;
};
