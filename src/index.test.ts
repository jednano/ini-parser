import test, { TestContext, Context } from 'ava'
import { readFile } from 'fs'
import * as globby from 'globby'
import * as path from 'path'

import Parser, {
	ParseOptions,
	Property,
	Section,
	Sections,
} from './'

const newline = '\n'

test('supports progressive configurations', t => {
	const parser = new Parser({ comment: /x/ })
	t.deepEqual(
		parser.parse('a=b xz').toString(),
		new Sections({
			items: [
				new Section({
					newline,
					nodes: [
						new Property('a', {
							delimiter: '=',
							value: 'b',
							raws: {
								after: ' xz',
							},
						}),
					],
				}),
			],
			newline,
		}).toString(),
	)
	parser.configure({ newline: /\|/ })
	t.deepEqual(
		parser.parse('a=b xy|c=d xz').toString(),
		new Sections({
			items: [
				new Section({
					newline,
					nodes: [
						new Property('a', {
							delimiter: '=',
							value: 'b',
							raws: {
								after: ' xy',
							},
						}),
						new Property('c', {
							delimiter: '=',
							value: 'd',
							raws: {
								after: ' xz',
							},
						}),
					],
				}),
			],
		}).toString(),
	)
})

test('does not throw with an empty configure call', t => {
	t.notThrows(() => {
		const parser = new Parser()
		parser.configure()
	})
})

test('throws with incompatible configuration options', t => {
	t.throws(
		// tslint:disable-next-line:no-any
		() => new Parser({ comment: 'foo' as any }),
		'Invalid option: comment; Expected: isRegExp | isFalse',
	)
	t.throws(
		// tslint:disable-next-line:no-any
		() => new Parser({ comment: null as any }),
		'Invalid option: comment; Expected: isRegExp | isFalse',
	)
	t.throws(
		// tslint:disable-next-line:no-any
		() => new Parser({ isCommentCharInProp: 'foo' as any }),
		'Invalid option: isCommentCharInProp; Expected: isBoolean',
	)
	t.throws(
		// tslint:disable-next-line:no-any
		() => new Parser({ delimiter: 'foo' as any }),
		'Invalid option: delimiter; Expected: isRegExp',
	)
	t.throws(
		// tslint:disable-next-line:no-any
		() => new Parser({ newline: 'foo' as any }),
		'Invalid option: newline; Expected: isRegExp',
	)
	t.throws(
		// tslint:disable-next-line:no-any
		() => new Parser({ resolve: 'foo' as any }),
		'Invalid option: resolve; Expected: isBoolean | isFunction',
	)
	t.throws(
		// tslint:disable-next-line:no-any
		() => new Parser({ foo: 'bar' } as any),
		'Invalid option: foo',
	)
})

test('new Parser().parse().items.length === 0', t => {
	t.is(new Parser().parse().items.length, 0)
})

globby.sync('src/fixtures/*').forEach(folder => {
	const f2 = path.join('../', folder)
	const index = require(f2) as string[]
	let input: string | undefined
	index.forEach((scenario, i) => {
		const n = i ? (i + 1).toString() : ''
		test.serial(scenario, testScenario(n))
	})

	function testScenario(n: string) {
		const parser = new Parser()
		// tslint:disable-next-line:no-any
		return async (t: TestContext & Context<any>) => {
			return Promise.all([
				requireIfExists<ParseOptions | undefined>(
					path.join(f2, `config${n}`),
				),
				readIfExists(path.join(folder, `input${n}.ini`)),
				requireIfExists<Sections | undefined>(
					path.join(f2, `expected${n}`),
				),
			]).then(compare)

			function compare(
				[
					config,
					_input,
				]: [
					ParseOptions | undefined,
					string | undefined,
					Sections | undefined
				],
			) {
				if (config) {
					parser.configure(config)
				}
				if (_input) {
					input = _input
				}
				t.snapshot(parser.parse(input))
			}
		}
	}

	function requireIfExists<T>(importPath: string) {
		return new Promise<T>((resolve) => {
			try {
				resolve(require(importPath))
			} catch {
				resolve(undefined)
			}
		})
	}

	function readIfExists(filepath: string) {
		return new Promise<string | undefined>((resolve) => {
			readFile(filepath, 'utf8', (err, data) => {
				resolve(err ? undefined : data)
			})
		})
	}
})
