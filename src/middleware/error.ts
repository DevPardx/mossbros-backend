import { Request, Response, NextFunction } from "express";
import { AppError } from "../handler/error.handler";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = ( err: Error, req: Request, res: Response, next: NextFunction ) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    console.error("Unexpected error:", err);

    return res.status(500).json({
        error: "Internal server error",
    });
};