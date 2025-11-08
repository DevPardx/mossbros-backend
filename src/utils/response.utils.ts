import { Response } from "express";

export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

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

export function sendCreated<T>(
    res: Response,
    data: T,
    message?: string
): Response {
    return sendSuccess(res, data, 201, message);
}

export function sendNoContent(res: Response): Response {
    return res.status(204).send();
}

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
