import { BadRequestError, NotFoundError } from "../handler/error.handler";

export function assertExists<T>(
    entity: T | null | undefined,
    entityName: string
): asserts entity is T {
    if (!entity) {
        throw new NotFoundError(`${entityName} no encontrado`);
    }
}

export function assertNotEmpty<T>(array: T[], errorMessage: string): void {
    if (array.length === 0) {
        throw new BadRequestError(errorMessage);
    }
}

export function assertTrue(condition: boolean, errorMessage: string): asserts condition {
    if (!condition) {
        throw new BadRequestError(errorMessage);
    }
}

export function assertSameLength<T, U>(
    arr1: T[],
    arr2: U[],
    errorMessage: string
): void {
    if (arr1.length !== arr2.length) {
        throw new BadRequestError(errorMessage);
    }
}

export function assertIsOneOf<T>(
    value: T,
    allowedValues: readonly T[],
    fieldName: string
): void {
    if (!(allowedValues as readonly unknown[]).includes(value)) {
        throw new BadRequestError(
            `${fieldName} debe ser uno de: ${allowedValues.join(", ")}`
        );
    }
}
