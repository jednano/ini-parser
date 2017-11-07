import test from 'ava'

import { ResolvedParseOptions } from './common'
import Comment from './Comment'

const options: ResolvedParseOptions = {
	comment: /[#;]/,
	isCommentCharInProp: false,
	delimiter: /[=:]/,
	newline: /\r?\n/,
	resolve: true,
}

test('returns null if comment option is false', t => {
	t.is(Comment.parse('# foo', { ...options, comment: false }), null)
})

test('returns null when parsing an empty string', t => {
	t.is(Comment.parse('', options), null)
})

test('returns null when there is no comment to parse', t => {
	t.is(Comment.parse('foo#bar', options), null)
})

test('parses a "#foo" comment', t => {
	const text = '#foo'
	t.snapshot(Comment.parse(text, options), text)
})

test('parses a "# foo" comment', t => {
	const text = '# foo'
	t.snapshot(Comment.parse(text, options), text)
})

test('parses a "#[foo]" comment when isCommentCharInProp: true', t => {
	const text = '#[foo]'
	t.snapshot(
		Comment.parse(text, {
			...options,
			isCommentCharInProp: true,
		}),
		text,
	)
})

test('parses a "# foo" comment when isCommentCharInProp: true', t => {
	const text = '# foo'
	t.snapshot(
		Comment.parse(text, {
			...options,
			isCommentCharInProp: true,
		}),
		text,
	)
})

test('parses a "#foo" comment as null when isCommentCharInProp: true', t => {
	const text = '#foo'
	t.is(
		Comment.parse(text, {
			...options,
			isCommentCharInProp: true,
		}),
		null,
	)
})

test('toString returns the original comment text', t => {
	t.is(Comment.parse('# foo', options) + '', '# foo')
})
