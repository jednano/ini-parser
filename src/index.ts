export interface ParseOptions {
	/**
	 * Indicates accepted comment chars. Only works if you specify single-char
	 * comment values in RegExp form. A setting of `false` turns off comments
	 * completely, treating comment chars as normal string values.
	 * @default {RegExp} /[#;]/
	 */
	comment?: RegExp | false
	/**
	 * Accepts comment chars at property key and value boundaries. If a space
	 * follows the comment char, it is considered an actual comment.
	 * Example: "#k;=#v; #z" -> { "#k;": "#v;" }
	 * @default {false} false
	 */
	commentCharAtPropBounds?: boolean,
	/**
	 * Indicates accepted delimiter chars. Only works if you specify
	 * single-char delimiter values in RegExp form.
	 * @default {RegExp} /[=:]/
	 */
	delimiter?: RegExp
	/**
	 * Indicates accepted newline sequences in the form of a RegExp.
	 * @default {RegExp} /\r?\n/
	 */
	newline?: RegExp
	/**
	 * By default, attempts to parse property values with `JSON.parse`.
	 * If unsuccessful, returns property value as a string. You may also
	 * provide your own resolve function here for custom property value
	 * resolution.
	 * @default {true} true
	 */
	resolve?: boolean | ResolveCallback
}

export interface ResolveCallback {
	(value: string, key?: string, fallback?: typeof parseValue): any
}

export interface ResolvedParseOptions {
	comment: RegExp | false
	commentCharAtPropBounds: boolean,
	delimiter: RegExp
	newline: RegExp
	resolve: boolean | ResolveCallback
}

export type ParseResult = [Props, Sections]
export type Props = Hash<Primitive | undefined>
export interface Hash<T> {
	[key: string]: T
}
export type Primitive = string | number | boolean
export type Sections = [string, Props][]

/**
 * Parser for the informal INI file format.
 */
export default class Parser {

	static defaultOptions: ResolvedParseOptions = {
		comment: /[#;]/,
		commentCharAtPropBounds: false,
		delimiter: /[=:]/,
		newline: /\r?\n/,
		resolve: true,
	}

	static optionValidators = {
		comment: [isRegExp, isFalse],
		commentCharAtPropBounds: [isBoolean],
		delimiter: [isRegExp],
		newline: [isRegExp],
		resolve: [isBoolean, isFunction],
	}

	private currentSection: Props
	private options: ResolvedParseOptions
	private parseResult: ParseResult

	constructor(options: ParseOptions = {}) {
		this.resetConfiguration()
		this.configure(options)
	}

	/**
	 * Resets configuration to default settings as if you created a
	 * `new Parser()`.
	 */
	public resetConfiguration() {
		this.options = { ...Parser.defaultOptions }
	}

	/**
	 * Sets configuration options, preserving existing configuration and
	 * overriding only the new keys you provide.
	 */
	public configure(options: ParseOptions = {}) {
		Object.keys(options).forEach(key => {
			const validators = Parser.optionValidators[key]
			if (!validators) {
				throw new Error(`Invalid option: ${key}`)
			}
			resolveOption.call(this, key, ...validators)
		})

		function resolveOption(
			this: Parser,
			key: string,
			...validators: Function[],
		) {
			const value = options[key]
			for (const validator of validators) {
				if (validator(value)) {
					this.options[key] = value
					return
				}
			}
			throw new Error([
				`Invalid option: ${key}`,
				`Expected: ${validators.map(v => v.name).join(' | ')}`,
			].join('; '))
		}
	}

	/**
	 * Parses INI file contents as a string. The result will be an array:
	 * - Index `0` will have any/all root properties.
	 * - Index `1` will have an array of any/all sections that follow.
	 * Note: repeated sections will also be repeated in the array.
	 * @param contents INI file contents.
	 */
	public parse(contents?: string) {
		this.parseResult = [this.currentSection = {}, []]
		if (!contents) {
			return this.parseResult
		}
		contents
			.split(this.options.newline as RegExp)
			.forEach(this.parseLine.bind(this))
		return this.parseResult
	}

	private parseLine(text: string) {
		text = text.trim()
		if (this.parseSection(text)) {
			return
		}
		if (this.parseProperty(text)) {
			return
		}
	}

	private parseSection(text: string) {
		const {
			options: {
				comment,
			},
			parseResult,
		} = this

		let isEscaped = false
		let depth = 0
		let key = ''
		let isSection = false
		let isComment = false

		for (const char of text) {
			if (depth) {
				if (isEscaped) {
					isEscaped = false
					if (!/[\\\[\]]/.test(char)) {
						key += '\\'
					}
					key += char
					continue
				}
				if (char === '\\') {
					isEscaped = true
					continue
				}
			}
			if (char === '[') {
				if (isComment) {
					return true
				}
				isSection = true
				if (++depth > 1) {
					key += char
				}
				continue
			}
			if (char === ']') {
				if (--depth === 0) {
					break
				}
				key += char
				continue
			}
			if (depth) {
				key += char
				continue
			}
			if (comment && comment.test(char)) {
				isComment = true
				continue
			}
			return false
		}
		if (isSection) {
			key = key.trim()
			parseResult[1].push([key, this.currentSection = {}])
		}
		return isSection
	}

	private parseProperty(text: string) {
		const {
			comment,
			delimiter,
			commentCharAtPropBounds,
			resolve,
		} = this.options

		let key: string | undefined
		let value: string | undefined
		let isKey = false
		let isValue = false
		let isComment = false
		let isSingleQuoted = false
		let isDoubleQuoted = false
		let isQuoted = false
		let isEscaped = false
		let isBracketed = false
		let endQuotePos = 0
		let acc: string | undefined = ''

		for (const char of text) {
			if (isComment) {
				if (char === ' ') {
					return false
				}
				isComment = false
			}
			if (isEscaped) {
				isEscaped = false
				acc += char
				if (!isValue) {
					isKey = true
				}
				continue
			}
			if (char === '\\') {
				isEscaped = true
				continue
			}
			if (isValue && (!resolve || /[\{\[]/.test(char))) {
				isBracketed = true
				acc += char
				continue
			}
			if (char === '"' && !isSingleQuoted) {
				isQuoted = isDoubleQuoted = !isDoubleQuoted
				if (isBracketed) {
					acc += char
				}
				if (!isQuoted) {
					endQuotePos = acc.length
				}
				continue
			}
			if (char === '\'' && !isDoubleQuoted) {
				isQuoted = isSingleQuoted = !isSingleQuoted
				if (!isQuoted) {
					endQuotePos = acc.length
				}
				continue
			}
			if (isQuoted) {
				acc += char
				if (!isValue) {
					isKey = true
				}
				continue
			}
			if (comment && comment.test(char)) {
				if (commentCharAtPropBounds) {
					if (isValue && /\s$/.test(acc)) {
						break
					}
					isComment = true
					acc += char
					continue
				}
				if (!isValue && !acc && !endQuotePos) {
					return false
				}
				break
			}
			if (isKey && delimiter.test(char)) {
				key = this.trim(acc, endQuotePos)
				endQuotePos = 0
				isKey = isQuoted = isSingleQuoted = isDoubleQuoted = false
				isValue = true
				acc = ''
				continue
			}
			if (acc || /\S/.test(char)) {
				acc += char
				if (!isValue) {
					isKey = true
				}
			}
		}
		if (isKey) {
			key = this.trim(acc, endQuotePos)
			this.currentSection[key] = void 0
			return true
		}
		if (isValue) {
			value = this.trim(acc, endQuotePos)
			this.currentSection[key as string] = this.resolveValue(
				value,
				key as string,
			)
			return true
		}
		return false
	}

	private trim(value: string, endQuotePos: number) {
		const trimmed = value.trim()
		return (trimmed.length > endQuotePos)
			? trimmed
			: value.substring(0, endQuotePos)
	}

	private resolveValue(value: string, key: string) {
		const { options: { resolve }} = this
		if (resolve === true) {
			return parseValue(value)
		}
		if (resolve) {
			return resolve(value, key, parseValue)
		}
		return value
	}
}

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

function isRegExp(value?: any): value is RegExp {
	return (value)
		? !!(value as RegExp).compile
		: false
}

function isFalse(value?: any): value is false {
	return value === false
}

function isBoolean(value?: any): value is Boolean {
	return value === true || value === false
}

function isFunction(value?: any): value is Function {
	return typeof value === 'function'
}
