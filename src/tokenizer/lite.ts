import time from '../time/time'
import { Token, WordPart } from './_interfaces'

const prefixes = { context: '+', person: '@', tracker: '#' }

/**
 * getValueString
 * Returns a value string from #tracker(value)
 * @param {String} word
 */
function getValueString(word: string): number {
  const wordSplit = word.split('(')
  let value = wordSplit.length === 2 ? wordSplit[1].replace(')', '') : '1'
  value = value.length ? value : '1'
  return parseStringValue(value)
}

/**
 * Parse String Value
 * Convert a string into a value, or a time string 01:03:44 into seconds
 * @param valueStr String
 */
function parseStringValue(valueStr: string): number {
  if (valueStr.split('.').length === 2) {
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
  const cleanedWord: string = word.replace(/(’s|'s|'|,|\.|!|’|\?|:)/gi, '')
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
function parse(str: string = ''): Array<Token> {
  // Split it into an array of lines
  const lines = str.split(/\r?\n/)
  const final: Array<Token> = []
  // Loop over each line
  lines.forEach((line) => {
    // Extract
    const tokens = parseStr(line)
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
 * Parse a Line to an array.
 * @param {String} str
 */
function parseStr(str: string): any {
  const wordArray = str.trim().split(' ')
  return (
    // Split on the space
    wordArray
      .map((word: string) => {
        // Loop over each word
        const scrubbed = scrub(word) // Scrub it clean
        const valueStr = getValueString(word)
        const firstChar = word.trim().substr(0, 1)
        // switch on first character
        if (firstChar === '#' && word.length > 1) {
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
        } else if (firstChar === '@' && word.length > 1) {
          return toToken(
            'person',
            scrubbed.word.toLowerCase(),
            valueStr,
            scrubbed.remainder
          )
        } else if (firstChar === '+' && word.length > 1) {
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

export default parse
