import { Request, Response, NextFunction } from "express";
import { AppError, InternalServerError } from "../handler/error.handler";

export const catchAsync = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

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
