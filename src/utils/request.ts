import { Request } from "express";
import { BadRequestError } from "../handler/error.handler";

export function getRequiredParam(req: Request, paramName: string): string {
    const value = req.params[paramName];
    if (!value) {
        throw new BadRequestError(`Missing required parameter: ${paramName}`);
    }
    return value;
}

export function getRequiredQuery(req: Request, queryName: string): string {
    const value = req.query[queryName];
    if (!value || typeof value !== "string") {
        throw new BadRequestError(`Missing required query parameter: ${queryName}`);
    }
    return value;
}

export function getOptionalQuery(req: Request, queryName: string, defaultValue: string = ""): string {
    const value = req.query[queryName];
    if (!value || typeof value !== "string") {
        return defaultValue;
    }
    return value;
}
