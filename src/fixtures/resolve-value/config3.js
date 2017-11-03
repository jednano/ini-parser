module.exports = {
    "resolve": (value, key, parseValue) => {
        if (key === 'k9') {
            return value + '!'
        }
        if (key === 'k10') {
            return parseValue(value)
        }
        return value + 'z'
    }
}