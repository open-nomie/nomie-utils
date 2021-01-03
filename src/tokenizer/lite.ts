import time from '../time/time'
import { Token, WordPart } from './_interfaces'
import mathEval from 'math-expression-evaluator'

const prefixes = { context: '+', person: '@', tracker: '#', place: '/' }

/**
 *
 * Get Parsed Value from word
 * Returns a value string from #tracker(value)
 *
 * @param {String} word
 */
function getParsedValue(word: string): ParsedStringValue {
  const wordSplit = word.split('(')
  let value = wordSplit.length === 2 ? wordSplit[1].replace(')', '') : '1'
  value = value.length ? value : '1'
  return parseStringValue(value)
}

interface ParsedStringValue {
  value: number
  uom?: string
}

/**
 * Parse String Value
 * Convert a string into a value, or a time string 01:03:44 into seconds
 * @param valueStr String
 */
function parseStringValue(valueStr: string): ParsedStringValue {
  const uomMatch = valueStr.match(/[a-z/%$]+/gi)
  const uom = uomMatch ? uomMatch[0] : undefined

  if (valueStr.match(/\+|-|\/|\*|Mod|\(|\)/)) {
    valueStr = valueStr.replace(/[a-z]+/gi, '')
    try {
      return {
        value: parseFloat(mathEval.eval(valueStr)),
        uom
      }
    } catch (e) {
      return {
        value: 0,
        uom
      }
    }
  } else if (valueStr.split('.').length === 2) {
    return {
      value: parseFloat(valueStr),
      uom
    }
  } else if (valueStr.search(':') > -1) {
    return {
      value: time.timestringToSeconds(valueStr),
      uom: 'timer'
    }
  } else {
    return {
      value: parseInt(valueStr),
      uom
    }
  }
}

/**
 *
 * Scrub
 * Removes common word ending characters
 *
 * @param {String} word
 */
function scrub(word: string): WordPart {
  // let uom:string;
  const cleanedWord: string = word.replace(/(’s|'s|'|,|\.|!|’|\?|:)/gi, '')
  return {
    word: cleanedWord,
    remainder: word.replace(cleanedWord, '')
  }
}

/**
 *
 * toToken
 * Creates a payload that can be turned into a
 *
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
  raw?: string | any,
  uom?: string
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
    remainder, //any trailing words
    uom
  }
}

/**
 *
 * Parse
 * parses a string and returns an array of
 * elements
 *
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
 *
 * Parse a Line to an array.
 * @param {String} str
 *
 */
function parseStr(str: string): any {
  const wordArray = str.trim().split(' ')
  return (
    // Split on the space
    wordArray
      .map((word: string) => {
        // Loop over each word
        const scrubbed = scrub(word) // Scrub it clean
        const parsedValueString = getParsedValue(word)

        const firstChar = word.trim().substr(0, 1)
        // switch on first character
        if (firstChar === '#' && word.length > 1) {
          if (word.match(/\d\d:\d\d/)) {
            // if it's a timer
            return toToken(
              'tracker',
              word,
              parsedValueString.value,
              scrubbed.remainder.replace(word, ''),
              null,
              parsedValueString.uom
            )
          } else {
            return toToken(
              'tracker',
              scrubbed.word,
              parsedValueString.value,
              scrubbed.remainder.replace(word, ''),
              null,
              parsedValueString.uom
            )
          }
        } else if (firstChar === '@' && word.length > 1) {
          return toToken(
            'person',
            scrubbed.word.toLowerCase(),
            parsedValueString.value,
            scrubbed.remainder,
            null,
            parsedValueString.uom
          )
        } else if (firstChar === '+' && word.length > 1) {
          return toToken(
            'context',
            scrubbed.word,
            parsedValueString.value,
            scrubbed.remainder,
            null,
            parsedValueString.uom
          )
        } else if (firstChar === '/' && word.length > 1) {
          return toToken(
            'place',
            scrubbed.word,
            parsedValueString.value,
            scrubbed.remainder,
            null,
            parsedValueString.uom
          )
        } else if (word.search(/(\w){3}:\/\/(\w)/) > -1) {
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
