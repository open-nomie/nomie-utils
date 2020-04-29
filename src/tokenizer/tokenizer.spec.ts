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

  expect(tokenizeDeep('#walked(1.6mile)').get('tracker', 'walked').sum).toBe(
    1.6
  )
  expect(tokenizeDeep('#💩(1.6mile)').get('tracker', '💩').sum).toBe(1.6)
  expect(tokenizeDeep('+💩').get('context', '💩')).toBeTruthy()
  expect(tokenizeDeep('@💩').get('person', '💩')).toBeTruthy()

  // Does not exist
  expect(results.get('tracker', 'turkey')).toBeFalsy()
  expect(results.get('turkey', 'turkey')).toBeFalsy()
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