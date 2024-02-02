export function record<T extends {}>(
    guard: (value: any) => T
): (value: unknown) => T {
    return (value: unknown): T => {
        return guard(object(value))
    }
}

/**
 * Asserts a condition to be true, and if it isn't, throws an error.
 * @param condition Condition
 * @param msg Optional error message, if the condition is falsy
 */
export function assert(condition: unknown, msg?: string): asserts condition {
    if (condition === false) throw new Error(msg)
}

/**
 * Creates a validator for the given literal, which asserts the passed value to be the literal & returns it.\
 * Use [[string_literal]] over this if you're trying to check a string literal.
 * @param literal Literal value to check for
 * @returns Validator
 */
export function literal<T>(literal: T): (value: unknown) => T {
    return (value: unknown): T => {
        assert(literal === value)
        return value as T
    }
}

/**
 * Creates a validator for the given string literal, which asserts the passed value to be the literal & returns it.\
 * Useful over [[literal]] for strings, as it returns the literal type of the string instead of a "string".
 * @param literal Literal string to check for
 * @returns Validator
 */
export function string_literal<T extends string>(
    literal: T
): (value: unknown) => T {
    return (value: unknown): T => {
        assert(literal === value)
        return value as T
    }
}

/**
 * Creates an OR validator which calls both passed validators, and returns the first one to be truthy. If neither are truthy, it will error.\
 * ORs are chainable, through passing another OR into the right hand side.
 * ```ts
 * // Checks if the passed value is "Critical" | "Medium" | "Low"
 * const priority = guard.or(
 *     guard.string_literal("Critical"),
 *     guard.or(guard.string_literal("Medium"), guard.string_literal("Low"))
 * )
 * ```
 * @param lhs Left hand side of OR
 * @param rhs Right hand side of OR
 * @returns Validator
 */
export function or<LHS, RHS>(
    lhs: (value: unknown) => LHS,
    rhs: (value: unknown) => RHS
): (value: unknown) => LHS | RHS {
    return (value: unknown): LHS | RHS => {
        const lhs_check = check(lhs)
        const lhs_result = lhs_check(value)
        if (lhs_result) return value as any

        const rhs_check = check(rhs)
        const rhs_result = rhs_check(value)
        if (rhs_result) return value as any

        throw new Error("Union check failed")
    }
}

/**
 * Creates an AND validator which calls both passed validators, and returns both. If any validator is falsy, it will error.\
 * ANDs are chainable, through passing another AND into the right hand side.
 * @param lhs Left hand side of AND
 * @param rhs Right hand side of AND
 * @returns Validator
 */
export function and<LHS, RHS>(
    lhs: (value: unknown) => LHS,
    rhs: (value: unknown) => RHS
): (value: unknown) => LHS | RHS {
    return (value: unknown): LHS & RHS => {
        const lhs_check = check(lhs)
        const lhs_result = lhs_check(value)
        if (!lhs_result) throw new Error("Intersection check failed")

        const rhs_check = check(rhs)
        const rhs_result = rhs_check(value)
        if (!rhs_result) throw new Error("Intersection check failed")

        return value as any
    }
}

/**
 * Creates a validator which checks whether a value is undefined, and further narrows it down using the passed validator if it isn't undefined.\
 * The validator can either return undefined or a further narrowed value.
 * @param guard Validator to be used if the passed value isn't undefined
 * @returns Validator
 */
export function optional<T>(
    guard: (value: unknown) => T
): (value?: unknown) => T | undefined {
    return (value?: unknown): T | undefined => {
        if (!value) return undefined
        return guard(value)
    }
}

/**
 * Asserts whether the passed value is a string.
 * @param value Value to check
 * @returns String
 */
export function string(value: unknown): string {
    assert(typeof value == "string")
    return value
}

/**
 * Asserts whether the passed value is a number.
 * @param value Value to check
 * @returns Number
 */
export function number(value: unknown): number {
    assert(typeof value == "number")
    return value
}

/**
 * Asserts whether the passed value is a bigint.
 * @param value Value to check
 * @returns Bigint
 */
export function bigint(value: unknown): bigint {
    assert(typeof value == "bigint")
    return value
}

/**
 * Asserts whether the passed value is a boolean.
 * @param value Value to check
 * @returns boolean
 */
export function boolean(value: unknown): boolean {
    assert(typeof value == "boolean")
    return value
}

/**
 * Asserts whether the passed value is a function.
 * @param value Value to check
 * @returns Function
 */
export function callback(value: unknown): Function {
    assert(typeof value == "function")
    return value
}

/**
 * Asserts whether the passed value is an Object.
 * @param value Value to check
 * @returns Object
 */
export function object(value: unknown): Object {
    assert(typeof value == "object")
    return value as Object
}

/**
 * Wraps the passed guard in a try catch, returning a narrowed value if the check succeeds, or null if it fails.
 * @param guard Guard to wrap
 * @returns Validator
 */
export function check<T>(
    guard: (value: unknown) => T
): (value: unknown) => T | null {
    return (value: unknown): T | null => {
        try {
            return guard(value)
        } catch {
            return null
        }
    }
}
