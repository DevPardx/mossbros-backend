import { Request, Response, NextFunction } from "express";
import { AppError, InternalServerError } from "../handler/error.handler";

/**
 * Async handler wrapper for Express route handlers
 * Automatically catches errors and passes them to the error middleware
 *
 * @param fn - Async function to wrap
 * @returns Express middleware function
 */
export const catchAsync = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Service method wrapper that handles error transformation
 * Preserves AppError instances and wraps other errors in InternalServerError
 *
 * @param fn - Async service method to wrap
 * @param errorMessage - Custom error message for internal server errors
 * @returns Wrapped async function
 */
export const catchServiceError = <T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    errorMessage: string
): T => {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError(errorMessage);
        }
    }) as T;
};
