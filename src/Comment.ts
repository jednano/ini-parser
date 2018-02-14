import { ResolvedParseOptions } from './common'
import Node, { NodeRaws } from './Node'

export default class Comment extends Node {

	static type: 'comment' = 'comment'

	static parse(
		text: string,
		options: ResolvedParseOptions,
	) {
		const {
			comment,
			isCommentCharInProp,
		} = options

		if (!comment) {
			return null
		}

		const firstChar = text[0]
		if (!comment.test(firstChar)) {
			return null
		}

		let indicator = ''

		for (const char of text) {
			if (indicator) {
				if ([' ', '['].indexOf(char) !== -1) {
					return new Comment(indicator, text.substr(1))
				}
				break
			}
			indicator = char
			if (!isCommentCharInProp) {
				return new Comment(indicator, text.substr(1))
			}
		}
		return null
	}

	public raws: NodeRaws = {}

	constructor(
		/**
		 * Indicates the start of a comment (e.g., # or ;).
		 */
		public indicator: string,
		/**
		 * The text that follows the comment indicator.
		 */
		public text: string,
	) {
		super()
	}

	public toString() {
		const {
			indicator,
			text,
		} = this
		return [
			indicator,
			text,
		].join('')
	}
}
