export interface Token {
  id: string
  raw: string // Raw word
  prefix: string // #,@,+
  type: string // type of trackableElement
  value?: string | number // value of the tracker
  remainder?: string //any trailing words
  uom?: string
}

export interface DeepResults {
  trackers: Array<any>
  context: Array<any>
  people: Array<any>
  links: Array<any>
  tokens: Array<Token>
  get: Function
}

export interface WordPart {
  word: string
  remainder: string // ending parts of a word, < like that comma
}
