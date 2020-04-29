import time from '../time/time'

export interface WordPart {
  word: string
  remainder: string
}
export interface Token {
  id: string
  raw: string // Raw word
  prefix: string // #,@,+
  type: string // type of trackableElement
  value: string | number // value of the tracker
  remainder: string //any trailing words
}

export interface DeepResults {
  trackers: Array<any>
  context: Array<any>
  people: Array<any>
  tokens: Array<Token>
}

/**
 * getValueString
 * Returns a value string from #tracker(value)
 * @param {String} word
 */
function getValueString(word: string): number {
  const wordSplit = word.split('(')
  let value = wordSplit.length == 2 ? wordSplit[1].replace(')', '') : '1'
  value = value.length ? value : '1'
  return parseStringValue(value)
}

/**
 * Parse String Value
 * Convert a string into a value, or a time string 01:03:44 into seconds
 * @param valueStr String
 */
function parseStringValue(valueStr: string): number {
  if (valueStr.split('.').length == 2) {
    return parseFloat(valueStr)
  } else if (valueStr.search(':') > -1) {
    return time.timestringToSeconds(valueStr)
  } else {
    return parseInt(valueStr)
  }
}

/**
 * Scrub
 * Removes common word ending characters
 * @param {String} word
 */
function scrub(word: string): WordPart {
  const cleanedWord: string = word.replace(/(\'|\,|\.|\!|’|\?|:)/gi, '')
  return {
    word: cleanedWord,
    remainder: word.replace(cleanedWord, '')
  }
}

/**
 * toToken
 * Creates a payload that can be turned into a
 * @param {String} type tracker,context,person,generic
 * @param {String} word
 * @param {String} value
 * @param {String} remainder
 */
const prefixes = { context: '+', person: '@', tracker: '#' }

function toToken(
  type: string,
  word: any,
  value: any = '',
  remainder: any = '',
  raw?: string | any
): Token {
  const prefix = prefixes[type] || ''
  const id = (word.search(/\(/) > -1
    ? word.replace(prefix, '').split('(')[0]
    : word.replace(prefix, '')
  ).toLowerCase()
  raw = raw || word || ''
  return {
    id,
    raw, // Raw word
    prefix, // #,@,+
    type, // type of trackableElement
    value, // value of the tracker
    remainder //any trailing words
  }
}

/**
 * Parse
 * parses a string and returns an array of
 * elements
 * @param {String} str
 */
function parse(str: string): Array<Token> {
  // Split it into an array of lines
  let lines = str.split(/\r?\n/)
  let final: Array<Token> = []
  // Loop over each line
  lines.forEach((line) => {
    // Extract
    let tokens = parseStr(line)
    tokens.forEach((token: Token) => {
      final.push(token)
    })
    // Add the line Break
    if (lines.length > 1) {
      final.push(toToken('line-break', ''))
    }
  })
  // Return parsed note
  return final
}

/**
 * Sum all numbers in an array
 * @param nums Array
 */
function sum(nums: Array<number>): number {
  return nums.reduce(function (a, b) {
    return a + b
  }, 0)
}
/**
 * Average all numbers in an array
 * @param nums Array
 */
function average(nums: Array<number>): number {
  const total = nums.reduce((acc, c) => acc + c, 0)
  return total / nums.length
}

/**
 * Deep Tokenization
 * Parse, and calculate base stats
 * @param nums Array
 */
function deep(str: string): DeepResults {
  let tokens: Array<Token> = parse(str)
  return {
    ...stats(tokens),
    ...{ tokens }
  }
}

/**
 * Parse a Line to an array.
 * @param {String} str
 */
function parseStr(str: string): any {
  let wordArray = str.trim().split(' ')
  return (
    // Split on the space
    wordArray
      .map((word: string) => {
        // Loop over each word
        let scrubbed = scrub(word) // Scrub it clean
        let valueStr = getValueString(word)
        let firstChar = word.trim().substr(0, 1)
        // switch on first character
        if (firstChar === '#') {
          if (word.match(/\d\d:\d\d/)) {
            // if it's a timer
            return toToken(
              'tracker',
              word,
              valueStr,
              scrubbed.remainder.replace(word, '')
            )
          } else {
            return toToken(
              'tracker',
              scrubbed.word,
              valueStr,
              scrubbed.remainder.replace(word, '')
            )
          }
        } else if (firstChar === '@') {
          return toToken(
            'person',
            scrubbed.word.toLowerCase(),
            valueStr,
            scrubbed.remainder
          )
        } else if (firstChar === '+') {
          return toToken('context', scrubbed.word, valueStr, scrubbed.remainder)
        } else if (word.search(/https:|http:/) > -1) {
          return toToken(
            'link',
            word.trim().replace(/(https|http):\/\//gi, ''),
            null,
            null,
            word.trim()
          )
        } else if (word) {
          return {
            id: `${word}`,
            type: 'generic',
            raw: `${word}`,
            prefix: null,
            remainder: null
          }
        }
        return null
      })
      .filter((word) => word)
  )
} // end parse string

/**
 * Stats
 * Generate stats for a set of tokens
 * @param tokens Array
 */
function stats(tokens: Array<Token>): DeepResults {
  let map: any = {
    trackers: {},
    people: {},
    context: {}
  }
  // Loop over tokens
  tokens.forEach((token: Token) => {
    // If its a tracker - do tracker things
    if (token.type == 'tracker') {
      map.trackers[token.id] = map.trackers[token.id] || { ...token }
      map.trackers[token.id].values = map.trackers[token.id].values || []
      map.trackers[token.id].values.push(token.value)
    } else {
      // Map person to people if needed
      let type = token.type == 'person' ? 'people' : token.type
      // Setup map for type
      map[type] = map[type] || {}
      map[type][token.id] = map[type][token.id] || { ...token }
      map[type][token.id].values = map[type][token.id].values || []
      map[type][token.id].values.push(1)
    }
  })

  // Create a Map for Results
  let results: any = {
    trackers: [],
    context: [],
    people: []
  }

  // Loop over the map to do final filtering
  Object.keys(map).forEach((type) => {
    let items = map[type]
    // Loop over items for this type
    results[type] = Object.keys(items).map((id) => {
      let token = items[id]
      token.sum = sum(token.values)
      token.avg = average(token.values)
      return token
    })
  })

  return {
    ...results,
    ...{ words: tokens.length }
  }
}

export const tokenizeDeep = deep
export const tokenize = function (str: string = ''): Array<Token> {
  return parse(str)
}
