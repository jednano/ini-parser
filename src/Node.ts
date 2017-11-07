export interface NodeRaws {
    /**
    * The text that follows the end of the node.
    */
    after?: string
}

export default abstract class Node {
    
    static type: 'comment' | 'property' | 'section'

    public abstract raws?: NodeRaws
    
    public abstract toString(): string
    
    public abstract toToken(): {
        type: typeof Node.type,
        [key: string]: any,
    }

    constructor(options: { [key: string]: any } = {}) {
        Object.keys(options).forEach(key => {
            this[key] = options[key]
        })
    }
}