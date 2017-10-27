# @jedmao/ini-parser

[![NPM version](http://img.shields.io/npm/v/@jedmao/ini-parser.svg?style=flat)](https://www.npmjs.com/package/@jedmao/ini-parser)
[![npm license](http://img.shields.io/npm/l/@jedmao/ini-parser.svg?style=flat-square)](https://www.npmjs.com/package/@jedmao/ini-parser)
[![Travis Build Status](https://img.shields.io/travis/jedmao/ini-parser.svg)](https://travis-ci.org/jedmao/ini-parser)
[![codecov](https://codecov.io/gh/jedmao/ini-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/jedmao/ini-parser)
[![Dependency Status](https://gemnasium.com/badges/github.com/jedmao/ini-parser.svg)](https://gemnasium.com/github.com/jedmao/ini-parser)

[![npm](https://nodei.co/npm/@jedmao/ini-parser.svg?downloads=true)](https://nodei.co/npm/@jedmao/ini-parser/)

A highly forgiving and configurable INI parser for the [informal INI file format](https://en.wikipedia.org/wiki/INI_file).

## Introduction

The INI file format is informal. Different parsers behave differently, in that they support different features. This parser aims to be a bit more flexible and [configurable](#options) to suite your needs, whatever they may be. Also, it assumes INI files out there in the wild could have some pretty crazy things in them. This parser does its best to understand whatever crazy you throw at it.

No dependencies on Node.js here, so you should be able to use it in the browser.

## Usage

```ini
; example.ini

a=b

[c]
d:e

[c]
f=g
```

```ts
import { readFileSync } from 'fs';
import Parser from '@jedmao/ini-parser';

const { configure, parse } = new Parser(/* config */);

parse(fs.readFileSync('./example.ini'));
```

See [`Parser#parse`](#parserparse-contents-string-) API.

### Result

```json
[
    {
        "a": "b"
    },
    [
        ["c", {
            "d": "e"
        }],
        ["c", {
            "f": "g"
        }]
    ]
]
```

## API

```ts
import Parser from '@jedmao/ini-parser';
```

### `new Parser( options?: ParseOptions )`

Class constructor. Accepts [`ParseOptions`](#interface-parseoptions) for initial configuration.

### `Parser#configure( options?: ParseOptions )`

Sets configuration options, preserving existing configuration and overriding only the new keys you provide.

### `Parser#resetConfiguration()`

Resets configuration to default settings as if you created a `new Parser()`.

### `Parser#parse( contents?: string )`

Parses INI file contents as a string. The result will be an array:
- Index `0` will have any/all root properties.
- Index `1` will have an array of any/all sections that follow.

_Note: repeated sections will also be repeated in the array._

See [`Usage`](#usage) for an example.

### `interface ParseOptions`

```ts
interface ParseOptions {
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
```

### `interface ResolveCallback`

```ts
interface ResolveCallback {
	(value: string, key?: string, fallback?: typeof parseValue): any
}
```

### `parseValue( value: string )`

Attempts to parse a string value with `JSON.parse`. If unsuccessful, returns input string untouched.

## Testing

Run the following command:

```
$ npm test
```

This will build scripts, run tests and generate a code coverage report. Anything less than 100% coverage will throw an error.

### Watching

For much faster development cycles, run the following commands in 2 separate processes:

```
$ npm run build:watch
```

Compiles TypeScript source into the `./dist` folder and watches for changes.

```
$ npm run watch
```

Runs the tests in the `./dist` folder and watches for changes.
