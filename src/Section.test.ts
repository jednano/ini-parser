import test from 'ava'
import Section from './Section'

test('new Section() instanceof Section', t => {
	t.is(new Section() instanceof Section, true)
})

test('parses empty sections', t => {
	[
		'[]',
		'[  ]',
	].forEach(text => {
		t.snapshot(Section.parse(text), text)
	})
})

test('parses a section', t => {
	const text = '[s]'
	t.snapshot(Section.parse(text), text)
})

test('parses and trims spaces inside section brackets', t => {
	[
		'[  s]',
		'[s  ]',
		'[  s  ]',
		'[  s  t  ]',
	].forEach(text => {
		t.snapshot(Section.parse(text), text)
	})
})

test('parses sections with nested brackets', t => {
	[
		'[[]',
		'[[]]',
		'[a[b]c]',
	].forEach(text => {
		t.snapshot(Section.parse(text), text)
	})
})

test('parses sections with escaped brackets', t => {
	[
		'[\\[]',
		'[\\]]',
	].forEach(text => {
		t.snapshot(Section.parse(text), text)
	})
})

test('parses a section followed by a closing bracket', t => {
	const text = '[s]]'
	const section = Section.parse(text)
	t.snapshot(section, text)
	t.is((section as Section).raws.after, ']')
})

test('parses a section with comment chars inside', t => {
	const text = '[#;]'
	t.snapshot(Section.parse(text), text)
})

test('parses sections followed by a comment', t => {
	[
		'[s1]#z',
		'[s2] #z',
		'[s3];z',
		'[s4] ;z',
	].forEach(text => {
		t.snapshot(Section.parse(text), text)
	})
})

test('does not parse a commented section', t => {
	[
		'#[s]',
		'# [s]',
		';[s]',
		'; [s]',
	].forEach(text => {
		t.is(Section.parse(text), null)
	})
})

test('parses slashes inside sections', t => {
	[
		'[a\\b\\c]',
		'[d\\\\e\\\\f]',
		'[g/h/i]',
	].forEach(text => {
		t.snapshot(Section.parse(text), text)
	})
})

test('toString returns "[s]x"', t => {
	t.is(new Section({ name: 's', raws: { after: 'x' }}) + '', '[s]x')
})
