import tokenizer from './lite'
import { DeepResults, Token } from './_interfaces'

const remap = {
  tracker: 'trackers',
  person: 'people',
  link: 'links'
}

/**
 * Stats
 * Generate stats for a set of tokens
 * @param tokens Array
 */
function stats(tokens: Array<Token>): DeepResults {
  const map: any = {
    trackers: {},
    people: {},
    context: {},
    links: {}
  }
  // Loop over tokens
  tokens.forEach((token: Token) => {
    const type = Object.prototype.hasOwnProperty.call(remap, token.type)
      ? remap[token.type]
      : token.type
    // set type if doesnt exist
    map[type] = map[type] || {}
    // Setup id in type, if not exist step to first token
    map[type][token.id] = map[type][token.id] || Object.assign(token, {})
    // Setup a holder vor the values
    map[type][token.id].values = map[type][token.id].values || []
    // Push the value, or default to 1
    map[type][token.id].values.push(token.value || 1)
  })

  // Create a Map for Results
  const results: any = {
    trackers: [],
    context: [],
    people: [],
    links: []
  }

  // Loop over the map to do final filtering
  Object.keys(map).forEach((type) => {
    const items = map[type]
    // Loop over items for this type
    results[type] = Object.keys(items).map((id) => {
      const token = items[id]
      token.sum = sum(token.values)
      token.avg = average(token.values)
      return token
    })
  })

  const response = results
  response.words = tokens.length

  return response
}

/**
 * Deep Tokenization
 * Parse, and calculate base stats
 * @param nums Array
 */
function deep(str: string): DeepResults {
  const tokens: Array<Token> = tokenizer(str)
  const response = stats(tokens)
  response.tokens = tokens
  // Return selectors
  response.get = (type: string, id: string) => {
    type = Object.prototype.hasOwnProperty.call(remap, type)
      ? remap[type]
      : type
    return Object.prototype.hasOwnProperty.call(response, type)
      ? response[type].find((t: Token) => t.id === id)
      : null
  }
  return response
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

export default deep
