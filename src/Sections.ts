import Comment from './Comment'
import Property from './Property'
import Section from './Section'

export default class Sections {

    public items: Section[]
    /**
     * The newline sequence used to stringify all the sections together.
     */
    public newline: string

    constructor(
        options: {
            items?: Section[],
            /**
             * The newline sequence used to stringify all the sections together.
             */
            newline?: string,
        } = {},
    ) {
        const {
            items = [],
            newline = '\n',
        } = options
        this.items = items
        this.newline = newline
    }

    private get current() {
        return this.items[this.items.length - 1]
    }

    public pushNode(node: Section | Property | Comment | null) {
        const {
            newline,
        } = this
        if (!node) {
            return
        }
        if (node instanceof Section) {
            this.items.push(node)
            return
        }
        if (!this.items.length) {
            this.items.push(new Section({
                newline,
            }))
        }
        this.current.nodes.push(node)
    }

    public toString() {
        return this.items.join(this.newline + this.newline)
    }
}