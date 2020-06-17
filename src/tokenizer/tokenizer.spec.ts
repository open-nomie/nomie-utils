// import { tokenize, tokenizeDeep } from './tokenize-note'

import tokenize from './lite'
import tokenizeDeep from './deep'

let note = `Testing #notes #notes(10.1) 
    #sleep(04:00:00) #sleep(00:10:00) #note #notes_boat 
@bob, @Bob! @mom @😡 
  https://google.com https://nomie.app
    +contexts +contextsy Sweet movie.`

test('should parse a note', () => {
  let tokens = tokenize(note)
  expect(tokens.filter((t) => t.type == 'context').length).toBe(2)
  expect(tokens.filter((t) => t.type == 'tracker').length).toBe(6)
  expect(tokens.filter((t) => t.type == 'person').length).toBe(4)
  expect(tokens.filter((t) => t.type == 'link').length).toBe(2)
})

test('should handle math values', () => {
  let addition = tokenize('note #math(4+4)')
  expect(addition[1].value).toBe(8)
  let multiply = tokenize('note #math(4*4)')
  expect(multiply[1].value).toBe(16)
  let division = tokenize('note #math(16/4)')
  expect(division[1].value).toBe(4)
  let withText = tokenize('note #math(16/4+4hrs)')
  expect(withText[1].value).toBe(8)
  let broken = tokenize('note #math(16/4+4hrs+&)')
  expect(broken[1].value).toBe(0)
})

test('should not find a single + as a context', () => {
  let note = `This is a + note`
  let results = tokenizeDeep(note)
  expect(results.context.length).toBe(0)
})

test('should handle handle links', () => {
  let linkNote = `This is a note with linkes! 
    https://github.com and https://nomie.app what about http://twitter.com/brandoncorbin and thats it
  `
  let results = tokenizeDeep(linkNote)
  expect(results.links.length).toBe(3)
  expect(results.links[0].raw).toBe('https://github.com')
  expect(results.links[2].raw).toBe('http://twitter.com/brandoncorbin')
})

test('should handle nothing gracefully', () => {
  expect(tokenize().length).toBe(0)
  expect(tokenize('').length).toBe(0)
  expect(tokenize('me').length).toBe(1)
  expect(tokenize('#balls()').length).toBe(1)
})

test('Should handle time strings properly', () => {
  let tokens = tokenize(note)
  expect(tokens).toBeTruthy()
  tokens.forEach((token) => {
    if (token.id == 'sleep') {
      expect(token.raw).toMatch(/(\d\d:\d\d)/)
    }
  })
})

test('should tokenize deep a note', () => {
  let results = tokenizeDeep(note)
  expect(results).toBeTruthy()
  expect(results.context.length).toBe(2)
  expect(results.people.length).toBe(3)
  expect(results.trackers.length).toBe(4)
  expect(results.get('tracker', 'sleep').sum).toBe(15000)
  // Does not exist
  expect(results.get('tracker', 'turkey')).toBeFalsy()
  expect(results.get('turkey', 'turkey')).toBeFalsy()
})

test('it should support including text in the value like #walked(1mile)', () => {
  expect(tokenize('#walked(1.6mile)')[0].value).toBe(1.6)
})

test('it should support funky endings', () => {
  expect(tokenize('#walked(1.6mile).')[0].id).toBe('walked')
  expect(tokenize('#walked(1.6mile),')[0].id).toBe('walked')
  expect(tokenize('#walked!!')[0].id).toBe('walked')
  expect(tokenize('#walked?')[0].id).toBe('walked')
})

test('it should handle funky characters', () => {
  expect(tokenizeDeep('#💩(1.6mile)').get('tracker', '💩').sum).toBe(1.6)
  expect(tokenizeDeep('+💩').get('context', '💩')).toBeTruthy()
  expect(tokenizeDeep('@💩').get('person', '💩')).toBeTruthy()
})

test("it should handle adding 's after things", () => {
  expect(tokenize(`@brandon's`)[0].id).toBe('brandon')
  expect(tokenize(`#brandon's`)[0].id).toBe('brandon')
  expect(tokenize(`+brandon's`)[0].id).toBe('brandon')
})

test('it should find the right type', () => {
  expect(tokenize(`@brandon's`)[0].type).toBe('person')
  expect(tokenize(`#brandon's`)[0].type).toBe('tracker')
  expect(tokenize(`+brandon's`)[0].type).toBe('context')
  expect(tokenize(`https://nomie.app`)[0].type).toBe('link')
})

test('stats should sum and average multiple of the same tag', () => {
  let results = tokenizeDeep(note)
  let noteTracker = results.trackers.find((el) => el.id == 'notes')
  expect(noteTracker.sum).toBe(11.1)
  expect(noteTracker.avg).toBe(5.55)
  expect(noteTracker.values.toString()).toBe([1, 10.1].toString())

  let sleepTracker = results.trackers.find((el) => el.id == 'sleep')
  expect(sleepTracker.values.toString()).toBe([14400, 600].toString())
  // let notes = results.stats.
})
