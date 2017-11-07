/**
 * Attempts to parse a string value with `JSON.parse`. If unsuccessful,
 * returns input string untouched.
 */
export function parseValue(value?: string) {
	if (!value) {
		return value
	}
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
		value: string | undefined,
		/**
		 * The key associated with the value.
		 */
		key: string,
		/**
		 * The built-in resolve function that you can use as a fallback.
		 */
		fallback: typeof parseValue,
	// tslint:disable-next-line:no-any
	): any
}

export interface ResolvedParseOptions {
	comment: RegExp | false
	isCommentCharInProp: boolean,
	delimiter: RegExp
	newline: RegExp
	resolve: boolean | ResolveCallback
}
