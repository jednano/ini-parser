import Comment from './Comment'
import Property from './Property'
import Section from './Section'
import Sections from './Sections'
import {
	ResolveCallback,
	ResolvedParseOptions,
} from './common'

export {
	Comment,
	Property,
	Section,
	Sections,
}

export interface ParseOptions {
	/**
	 * Indicates accepted comment chars. Only works if you specify single-char
	 * comment values in RegExp form. A setting of `false` turns off comments
	 * completely, treating comment chars as normal string values.
	 * @default {RegExp} /[#;]/
	 */
	comment?: RegExp | false
	/**
	 * Indicates accepted delimiter chars. Only works if you specify
	 * single-char delimiter values in RegExp form.
	 * @default {RegExp} /[=:]/
	 */
	delimiter?: RegExp
	/**
	 * Accepts comment chars in property key or value. If a space
	 * follows the comment char, it is considered an actual comment.
	 * Example: "#k;=#v; #z" -> { "#k;": "#v;" }
	 * @default {false} false
	 */
	isCommentCharInProp?: boolean,
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

/**
 * Parser for the informal INI file format.
 */
export default class Parser {

	static defaultOptions: ResolvedParseOptions = {
		comment: /[#;]/,
		delimiter: /[=:]/,
		isCommentCharInProp: false,
		newline: /\r?\n/,
		resolve: true,
	}

	static optionValidators = {
		comment: [isRegExp, isFalse],
		delimiter: [isRegExp],
		isCommentCharInProp: [isBoolean],
		newline: [isRegExp],
		resolve: [isBoolean, isFunction],
	}

	private options: ResolvedParseOptions
	private sections: Sections

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
			...validators: Function[]
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
		this.sections = new Sections()
		if (contents) {
			contents
				.split(this.options.newline as RegExp)
				.forEach(this.parseLine.bind(this))
		}
		return this.sections
	}

	private parseLine(text: string) {
		const { options } = this
		text = text.trim()
		this.sections.pushNode(
			Comment.parse(text, options) ||
			Section.parse(text) ||
			Property.parse(text, options),
		)
	}
}

// tslint:disable-next-line:no-any
function isRegExp(value?: any): value is RegExp {
	return (value)
		? !!(value as RegExp).compile
		: false
}

// tslint:disable-next-line:no-any
function isFalse(value?: any): value is false {
	return value === false
}

// tslint:disable-next-line:no-any
function isBoolean(value?: any): value is Boolean {
	return value === true || value === false
}

// tslint:disable-next-line:no-any
function isFunction(value?: any): value is Function {
	return typeof value === 'function'
}
