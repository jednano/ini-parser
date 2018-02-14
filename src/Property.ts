import Node, { NodeRaws } from './Node'
import {
	parseValue,
	ResolvedParseOptions,
} from './common'

export default class Property extends Node {

	static type: 'property' = 'property'

	static parse(
		text: string,
		options: ResolvedParseOptions,
	) {
		const {
			comment,
			isCommentCharInProp,
			delimiter,
			resolve,
		} = options

		let key: string | undefined
		let value: string | undefined
		let isKey = false
		let isValue = false
		let isSingleQuoted = false
		let isDoubleQuoted = false
		let isQuoted = false
		let isEscaped = false
		let isBracketed = false
		let endQuotePos = 0
		let acc: string | undefined = ''
		let delimiterValue: string | undefined
		let isComment = false
		let endPos = 0
		let spaceCount = 0

		for (const char of text) {
			endPos++
			if (isComment) {
				if (char === ' ') {
					endPos--
					break
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
				spaceCount = 0
				continue
			}
			if (isValue && (!resolve || /[\{\[]/.test(char))) {
				isBracketed = true
				acc += char
				spaceCount = 0
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
				spaceCount = 0
				continue
			}
			if (char === '\'' && !isDoubleQuoted) {
				isQuoted = isSingleQuoted = !isSingleQuoted
				if (!isQuoted) {
					endQuotePos = acc.length
				}
				spaceCount = 0
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
				if (isCommentCharInProp) {
					isComment = true
					if (isValue && /\s$/.test(acc)) {
						endPos--
						break
					}
					acc += char
					continue
				}
				if (!isValue && !acc && !endQuotePos) {
					return null
				}
				endPos--
				break
			}
			if (char === ' ') {
				spaceCount++
			} else {
				spaceCount = 0
			}
			if (isKey && delimiter.test(char)) {
				delimiterValue = char
				key = trim(acc, endQuotePos)
				endQuotePos = 0
				isKey = isQuoted = isSingleQuoted = isDoubleQuoted = false
				isValue = true
				acc = ''
				spaceCount = 0
				continue
			}
			if (acc || /\S/.test(char)) {
				acc += char
				if (!isValue) {
					isKey = true
				}
			}
		}
		const raws = {
			after: text.substr(endPos - spaceCount),
		}
		if (isKey) {
			key = trim(acc, endQuotePos)
			return new Property(key, { raws })
		}
		if (isValue) {
			value = trim(acc, endQuotePos)
			return new Property(
				key as string,
				{
					delimiter: delimiterValue,
					value: resolveValue(value, key as string),
					raws,
				},
			)
		}
		return null

		function resolveValue(value2: string, key2: string) {
			if (resolve === true) {
				return parseValue(value2)
			}
			if (resolve) {
				return resolve(value2, key2, parseValue)
			}
			return value2
		}
	}

	/**
	 * The delimiter character that separates the key from the value.
	 */
	public delimiter?: string
	/**
	 * The key or name of the property.
	 */
	public key: string
	/**
	 * The property value.
	 */
	// tslint:disable-next-line:no-any
	public value?: any
	public raws: NodeRaws

	constructor(
		/**
		 * The key or name of the property.
		 */
		key: string,
		{
			delimiter,
			value,
			raws = {
				after: '',
			},
		}: {
			/**
			 * The delimiter character that separates the key from the value.
			 */
			delimiter?: string,
			/**
			 * The property value.
			 */
			// tslint:disable-next-line:no-any
			value?: any,
			raws?: NodeRaws,
		} = {},
	) {
		super({
			key,
			delimiter,
			value,
			raws,
		})
	}

	public toString() {
		const {
			delimiter,
			key,
			value,
			raws: {
				after,
			},
		} = this
		return [
			key,
			delimiter,
			value,
			after,
		].join(' ')
	}
}

function trim(value: string, endQuotePos: number) {
	const trimmed = value.trim()
	return (trimmed.length > endQuotePos)
		? trimmed
		: value.substring(0, endQuotePos)
}
