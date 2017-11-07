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
			delimiter,
			commentCharAtPropBounds,
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
		let commentValue = ''

		for (const char of text) {
			if (commentValue) {
				if (commentValue.length > 1 || char === ' ') {
					commentValue += char
					continue
				}
				commentValue = ''
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
					commentValue = char
					acc += char
					continue
				}
				if (!isValue && !acc && !endQuotePos) {
					return null
				}
				break
			}
			if (isKey && delimiter.test(char)) {
				delimiterValue = char
				key = trim(acc, endQuotePos)
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
            key = trim(acc, endQuotePos)
            return new Property(key)
		}
		if (isValue) {
			value = trim(acc, endQuotePos)
			return new Property(
				key as string,
				{
					delimiter: delimiterValue,
					value: resolveValue(value, key as string),
					raws: {
						after: commentValue,
					},
				},
			)
		}
		return null

        function resolveValue(value: string, key: string) {
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
	 * The delimiter character that separates the key from the value.
	 */
	public delimiter = '='
	/**
	 * The key or name of the property.
	 */
	public key: string
	/**
	 * The property value.
	 */
	public value?: any
	public raws: NodeRaws = {}

    constructor(
		/**
		 * The key or name of the property.
		 */
		key: string,
		options: {
			/**
			 * The delimiter character that separates the key from the value.
			 */
			delimiter?: string,
			/**
			 * The property value.
			 */
			value?: any,
			raws?: NodeRaws,
		} = {},
    ) {
        super(options)
    }

    public toString() {
        const {
            delimiter,
            key,
			value,
			raws: {
				after,
			}
        } = this
        return [
            key,
            delimiter,
			value,
			after,
        ].join(' ')
    }

    public toToken() {
        const {
            key,
            delimiter,
            value,
        } = this
        return {
            type: Property.type,
            key,
            delimiter,
            value,
        }
    }
}

function trim(value: string, endQuotePos: number) {
	const trimmed = value.trim()
	return (trimmed.length > endQuotePos)
		? trimmed
		: value.substring(0, endQuotePos)
}
