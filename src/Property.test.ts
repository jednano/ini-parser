import test from 'ava'

import { ResolvedParseOptions, ResolveCallback } from './common'
import Property from './Property'

const options: ResolvedParseOptions = {
	comment: /[#;]/,
	isCommentCharInProp: false,
	delimiter: /[=:]/,
	newline: /\r?\n/,
	resolve: true,
}

test('new Property("k") instanceof Property', t => {
	t.is(new Property('k') instanceof Property, true)
})

test('parses a property with the = delimiter', t => {
	const text = 'k=v'
	t.snapshot(Property.parse(text, options), text)
})

test('parses a property with the : delimiter', t => {
	const text = 'k:v'
	t.snapshot(Property.parse(text, options), text)
})

test('parses a property with a custom delimiter', t => {
	const text = 'a=bxc:d'
	t.snapshot(
		Property.parse(text, { ...options, delimiter: /x/ }),
		`${text}, { delimiter: /x/ }`,
	)
})

test('parses a property without a delimiter', t => {
	const text = 'k'
	t.snapshot(Property.parse(text, options), text)
})

test('parses a property without a value', t => {
	const text = 'k='
	t.snapshot(Property.parse(text, options), text)
})

test('parses a property with an equal sign in the value', t => {
	const text = 'a=b=c'
	t.snapshot(Property.parse(text, options), text)
})

test('parses a property with an escaped equal sign in the key', t => {
	const text = 'a\\=b=c'
	t.snapshot(Property.parse(text, options), text)
})

test('parses a property with spaces in the key', t => {
	const text = 'a  b=c'
	t.snapshot(Property.parse(text, options), text)
})

test('parses a property with spaces in the value', t => {
	const text = 'a=b  c'
	t.snapshot(Property.parse(text, options), text)
})

test('parses and trims a property key', t => {
	const text = '  a  b  =c'
	t.snapshot(Property.parse(text, options), text)
})

test('parses and trims a property value', t => {
	const text = 'a=  b  c  '
	t.snapshot(Property.parse(text, options), text)
})

testCommentChars()

function testCommentChars() {
	const props = [
		'#k=v',
		'# k=v',
		'k#=v',
		'k=#v',
		'k="v"#z #',
		'k="v" #z',
	]

	test('parses a property that contains a comment char', t => {
		props.forEach(text => {
			t.snapshot(Property.parse(text, options), text)
		})
	})

	test('preserves comment chars in prop if isCommentCharInProp', t => {
		props.forEach(text => {
			t.snapshot(
				Property.parse(text, {
					...options,
					isCommentCharInProp: true,
				}),
				text,
			)
		})
	})

	test('parses entire string as property when when comment=false', t => {
		props.forEach(text => {
			t.snapshot(
				Property.parse(text, {
					...options,
					comment: false,
				}),
				text,
			)
		})
	})
}

test('parses a quoted property key', t => {
	[
		'"a"=b',
		'a"b"=c',
		'"a"b=c',
		'a"b"c=d',
		'"#"=v',
		'";"=v',
		'"\'a\'"=b',
		'\'"a"\'=b',
		'"a\'b\'c"=d',
		'\'a"b"c\'=d',
	].forEach(text => {
		t.snapshot(Property.parse(text, options), text)
	})
})

test('parses a quoted property value', t => {
	[
		'a="b"',
		'a=b"c"',
		'a="b"c',
		'a=b"c"d',
		'a="#"',
		'a=";"',
		'a="\'b\'"',
		'a=\'"b"\'',
		'a="b\'c\'d"',
		'a=\'b"c"d\'',
		'a="b\"c\"d"',
		'a=\'b\\\'c\\\'d\'',
	].forEach(text => {
		t.snapshot(Property.parse(text, options), text)
	})
})

testResolve()

function testResolve() {
	const props = [
		'k=v',
		'k=42',
		'k=true',
		'k=false',
		'k=["a", "b"]',
		'k={"c": "d"}',
		'k=[1, 2, 3]',
		'k=null',
	]

	test('resolves primitive property values when resolve=true', t => {
		props.forEach(text => {
			t.snapshot(Property.parse(text, options), text)
		})
	})

	test('resolves all values as strings when resolve=false', t => {
		const opts: ResolvedParseOptions = {
			...options,
			resolve: false,
		}
		props.forEach(text => {
			t.snapshot(Property.parse(text, opts), text)
		})
	})

	test('resolves with a custom function when resolve=fn', t => {
		const opts: ResolvedParseOptions = {
			...options,
			resolve: ((value, key, parseValue) => {
				if (key === 'bang') {
					return value + '!'
				}
				if (key === 'fallback') {
					return parseValue(value)
				}
				return value + 'z'
			}) as ResolveCallback,
		};
		[
			'k=v',
			'bang=v',
			'fallback=true',
		].forEach(text => {
			t.snapshot(Property.parse(text, opts), text)
		})
	})
}
