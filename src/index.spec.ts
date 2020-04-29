import { tokenize, tokenizeDeep, uom } from './index'

test('should have tokenizer, tokenizerDeep, and uom', () => {
  expect(tokenize).toBeTruthy()
  expect(tokenizeDeep).toBeTruthy()
  expect(uom).toBeTruthy()
})
