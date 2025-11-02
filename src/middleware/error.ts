import { Request, Response, NextFunction } from "express";
import { AppError } from "../handler/error.handler";
import logger from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = ( err: Error, _req: Request, res: Response, _next: NextFunction ) => {
    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            logger.error(`AppError [${err.statusCode}]: ${err.message}`, { stack: err.stack });
        } else {
            logger.warn(`AppError [${err.statusCode}]: ${err.message}`);
        }

        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    logger.error("Unexpected error:", err);

    return res.status(500).json({
        error: "Internal server error",
    });
};