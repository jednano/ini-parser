export interface NodeRaws {
	/**
	 * The text that follows the end of the node.
	 */
	after?: string
}

export default abstract class Node {

	static type: 'comment' | 'property' | 'section'

	public abstract raws?: NodeRaws

	// tslint:disable-next-line:no-any
	constructor(options: { [key: string]: any } = {}) {
		Object.keys(options).forEach(key => {
			this[key] = options[key]
		})
	}

	public abstract toString(): string
}
