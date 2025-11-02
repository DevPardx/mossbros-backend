import { Response } from "express";

/**
 * Standard success response format
 */
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Sends a standardized success response
 *
 * @param res - Express response object
 * @param data - Data to send in response
 * @param statusCode - HTTP status code (default: 200)
 * @param message - Optional success message
 */
export function sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    message?: string
): Response {
    const response: SuccessResponse<T> = {
        success: true,
        data,
        ...(message && { message })
    };

    return res.status(statusCode).json(response);
}

/**
 * Sends a standardized created response (201)
 *
 * @param res - Express response object
 * @param data - Data to send in response
 * @param message - Optional success message
 */
export function sendCreated<T>(
    res: Response,
    data: T,
    message?: string
): Response {
    return sendSuccess(res, data, 201, message);
}

/**
 * Sends a standardized no content response (204)
 *
 * @param res - Express response object
 */
export function sendNoContent(res: Response): Response {
    return res.status(204).send();
}

/**
 * Calculates pagination metadata
 *
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export function calculatePagination(
    total: number,
    page: number,
    limit: number
): Pick<PaginatedResponse<unknown>, "total" | "page" | "limit" | "totalPages"> {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

/**
 * Creates a paginated response object
 *
 * @param data - Array of items
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResponse<T> {
    return {
        data,
        ...calculatePagination(total, page, limit)
    };
}
