/**
 * Attempts to parse a string value with `JSON.parse`. If unsuccessful,
 * returns input string untouched.
 */
export function parseValue(value: string) {
    if (value[0] === '"') {
        return value
    }
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

export interface ResolveCallback {
	(
        /**
         * The raw text to be resolved.
         */
        value?: string,
        /**
         * The key associated with the value.
         */
        key?: string,
        /**
         * The built-in resolve function that you can use as a fallback.
         */
        fallback?: typeof parseValue,
    ): any
}

export interface ResolvedParseOptions {
	comment: RegExp | false
	commentCharAtPropBounds: boolean,
	delimiter: RegExp
	newline: RegExp
	resolve: boolean | ResolveCallback
}
