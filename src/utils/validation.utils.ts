import { BadRequestError, NotFoundError } from "../handler/error.handler";

/**
 * Validates that an entity exists, throws NotFoundError if not
 *
 * @param entity - Entity to validate
 * @param entityName - Name of the entity for error message
 * @throws NotFoundError if entity is null or undefined
 */
export function assertExists<T>(
    entity: T | null | undefined,
    entityName: string
): asserts entity is T {
    if (!entity) {
        throw new NotFoundError(`${entityName} no encontrado`);
    }
}

/**
 * Validates that an array is not empty
 *
 * @param array - Array to validate
 * @param errorMessage - Custom error message
 * @throws BadRequestError if array is empty
 */
export function assertNotEmpty<T>(array: T[], errorMessage: string): void {
    if (array.length === 0) {
        throw new BadRequestError(errorMessage);
    }
}

/**
 * Validates that a condition is true
 *
 * @param condition - Condition to check
 * @param errorMessage - Error message if condition is false
 * @throws BadRequestError if condition is false
 */
export function assertTrue(condition: boolean, errorMessage: string): asserts condition {
    if (!condition) {
        throw new BadRequestError(errorMessage);
    }
}

/**
 * Validates that two arrays have the same length
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @param errorMessage - Error message if lengths don't match
 * @throws BadRequestError if lengths don't match
 */
export function assertSameLength<T, U>(
    arr1: T[],
    arr2: U[],
    errorMessage: string
): void {
    if (arr1.length !== arr2.length) {
        throw new BadRequestError(errorMessage);
    }
}

/**
 * Validates that a value is within an allowed set
 *
 * @param value - Value to check
 * @param allowedValues - Array of allowed values
 * @param fieldName - Name of the field for error message
 * @throws BadRequestError if value is not in allowed set
 */
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
