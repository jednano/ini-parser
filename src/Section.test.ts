import test from 'ava'
import Section from './Section'

test('parses a section', t => {
    t.snapshot(Section.parse('[s]'))
})