import test from 'ava'
import Section from './Section'
import Sections from './Sections'

test('new Sections() instanceof Sections', t => {
	t.is(new Sections() instanceof Sections, true)
})

test('Sections#pushNode(null) pushes nothing', t => {
	const sections = new Sections()
	t.is(sections.pushNode(null), undefined)
	t.is(sections.items.length, 0)
})

test('Sections#pushNode(section) pushes a section', t => {
	const sections = new Sections()
	sections.pushNode(new Section({ name: 's' }))
	t.is(sections.items.length, 1)
})
