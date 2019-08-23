# Snapshot report for `src/Section.test.ts`

The actual snapshot is saved in `Section.test.ts.snap`.

Generated by [AVA](https://ava.li).

## parses a section

> [s]

    Section {
      name: 's',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

## parses a section followed by a closing bracket

> [s]]

    Section {
      name: 's',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: ']',
      },
    }

## parses a section with comment chars inside

> [#;]

    Section {
      name: '#;',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

## parses and trims spaces inside section brackets

> [  s]

    Section {
      name: 's',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [s  ]

    Section {
      name: 's',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [  s  ]

    Section {
      name: 's',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [  s  t  ]

    Section {
      name: 's  t',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

## parses empty sections

> []

    Section {
      name: '',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [  ]

    Section {
      name: '',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

## parses sections followed by a comment

> [s1]#z

    Section {
      name: 's1',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '#z',
      },
    }

> [s2] #z

    Section {
      name: 's2',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: ' #z',
      },
    }

> [s3];z

    Section {
      name: 's3',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: ';z',
      },
    }

> [s4] ;z

    Section {
      name: 's4',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: ' ;z',
      },
    }

## parses sections with escaped brackets

> [\[]

    Section {
      name: '[',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [\]]

    Section {
      name: ']',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

## parses sections with nested brackets

> [[]

    Section {
      name: '[]',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [[]]

    Section {
      name: '[]',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [a[b]c]

    Section {
      name: 'a[b]c',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

## parses slashes inside sections

> [a\b\c]

    Section {
      name: 'a\\b\\c',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [d\\e\\f]

    Section {
      name: 'd\\e\\f',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }

> [g/h/i]

    Section {
      name: 'g/h/i',
      newline: `␊
      `,
      nodes: [],
      raws: {
        after: '',
      },
    }