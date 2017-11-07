import Comment from './Comment'
import Node, { NodeRaws } from './Node'
import Property from './Property'

export default class Section extends Node {

    static type: 'section' = 'section'

    static parse(text: string) {

		let isEscaped = false
		let depth = 0
		let name = ''
		let isSection = false

		for (const char of text) {
			if (depth) {
				if (isEscaped) {
					isEscaped = false
					if (!/[\\\[\]]/.test(char)) {
						name += '\\'
					}
					name += char
					continue
				}
				if (char === '\\') {
					isEscaped = true
					continue
				}
			}
			if (char === '[') {
				isSection = true
				if (++depth > 1) {
					name += char
				}
				continue
			}
			if (char === ']') {
				if (--depth === 0) {
					break
				}
				name += char
				continue
			}
			if (depth) {
				name += char
				continue
			}
			return null
		}
		if (isSection) {
            const after = text.substr(name.length + 2)
            return new Section({
                name: name.trim(),
                raws: {
                    after,
                },
            })
        }
        return null
    }

    /**
     * The name of the section (i.e., the text sandwiched between
     * brackets). The root section is the only section without a name.
     */
    public name?: string
    /**
     * The newline sequence used to stringify the section with its child
     * nodes.
     */
    public newline: string = '\n'
    /**
     * The nodes that belong to the section.
     */
    public nodes: (Property | Comment)[] = []
    public raws: NodeRaws = {
        after: ''
    }

    constructor(
        options: {
            /**
             * The name of the section (i.e., the text sandwiched between
             * brackets). The root section is the only section without a name.
             */
            name?: string,
            /**
             * The newline sequence used to stringify the section with its child
             * nodes.
             */
            newline?: string,
            /**
             * The newline sequence used to stringify the section with its child
             * nodes.
             */
            nodes?: (Property | Comment)[],
            raws?: NodeRaws,
        } = {},
    ) {
        super(options)
    }

    public toString() {
        const {
            name,
            newline,
            nodes,
            raws: {
                after,
            },
        } = this
        return [
            ...(typeof name === 'string' ? [`[${name}]${after}`] : []),
            ...nodes.map(node => node.toString()),
        ].join(newline)
    }

    public toToken() {
        const {
            name,
            nodes,
        } = this
        return {
            type: Section.type,
            name,
            nodes,
        }
    }
}
