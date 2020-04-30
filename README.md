# Nomie Utils

This library contains a set of node / browser javascript utilities that are used to power Nomie. They've been broken out of the app to allow for easier integration into other systems.

## What's Nomie?

An [Open Source Life Tracker / Mood Tracker / Data Journal](https://nomie.app/) that runs as a PWA / Web App and is completely private using either device only storage, or Blockstack.

![](https://shareking.s3.amazonaws.com/pb-l3LHnDdC5H-1586728691.png)

## Install

```
npm install nomie-utils --save-dev
```

# Note Tokenizer

Nomie stores all data for a record - as single note. For example `Today I #walked(4) with @mom and @dad #mood(6.7) +family`.

The tokenizer will break apart a note into individual tokens for each word. These tokens can then extact any values if present.

## Token Object

- **id**: an ID safe version of the word
- **value**: The value provided. E.g. the 6 in #walked(6)
- **raw**: the original word
- **type**: the type (tracker|context|person|link|line-break|generic)
- **prefix**: trigger character (#|+|@)
- **remainder**: Any trailing special characters. For example the "," in "@brandon,"

---

## tokenize(str)

Tokenizer will return an array of tokens for each word in the note provided.

```
const tokenize = require("nomie-utils").tokenize;
// or import { tokenize } from "nomie-utils"

const note = "I'm @brandon, this is a #tracker(20) +testing";
const tokens = tokenize(note);
console.log(tokens);
```

### Returns an array of tokens

```
[
    { id: 'I\'m',type: 'generic', raw: 'I\'m', prefix: null,  remainder: null },
    { id: 'brandon', raw: '@brandon', prefix: '@', type: 'person',value: 1, remainder: ',' },
    { id: 'this', type: 'generic', raw: 'this', prefix: null,  remainder: null },
    { id: 'is',type: 'generic', raw: 'is', prefix: null,  remainder: null },
    { id: 'a',type: 'generic', raw: 'a', prefix: null,  remainder: null },
    { id: 'tracker', type: 'tracker', raw: '#tracker(20)', prefix: '#', value: 20, remainder: '' },
    { id: 'testing', type: 'context', raw: '+testing', prefix: '+',value: 1, remainder: '' }
]
```

## tokenizeDeep(str)

Tokenizer Deep tokenizes the list, but also groups, counts, sums and averages each of the tokens.

### Conceptual Example

```
tokenizeDeep("hello @bob, #mood(43) +test")
```

```
{
  trackers: [
    {
      id: mood,
      raw: '#mood(43)',
      value: 43,
      sum: 43,
      avg: 43
    }
  ],
  people: [
    {
      id: bob,
      raw: '@bob',
      value: 1,
      sum: 1,
      avg: 1
    }
  ],
  context: [
    {
      id: test,
      raw: '+test',
      value: 1,
      sum: 1,
      avg: 1
    }
  ],
  links: [],
  tokens: [...array of tokens]
}
```

#### Code Example

```
const tokenizeDeep = require("nomie-utils").tokenizeDeep;
// or import { tokenizeDeep } from "nomie-utils"

const note = "Hello, I'm @brandon my #mood(6) and also #mood(2), I #owe(10) to @becky and #owe(1.5) to @tom and #owe(2) to @frank";

let tokensGrouped = tokenizeDeep(note);

let brandon = tokensGrouped.get("person", "brandon");
let mood = tokensGrouped.get("tracker", "mood");
let owes = tokensGrouped.get("tracker", "owe");

console.log(`✅ From this note: ${note}`);
console.log(`Brandon was included ${brandon.sum} times`);
console.log(`his mood is ${mood.avg}`);
console.log(`he owes ${tokensGrouped.people.length} people $${owes.sum} total`);

tokensGrouped.people.forEach((person) => {
  console.log("People", person.raw);
});

```

# Nomie UOM (Unit of Measurement)

In Nomie a tracker has an unit of measurement, even if it's the default of "count". For example, water might use Fluid Ounces. We use the UOM module to then display the values in the accepted format. Like 13 turning in to 14oz, or 100 turning in to \$100.00

## uom.format(value, uomKey)

Return a formated string of the value based on the UOM format

```
const uom = require("nomie-utils").uom;
// or import { uom } from "nomie-utils"

console.log(uom.format(100,'dollars')) // $100.00
console.log(uom.format(100, 'franc')) // Fr.100.00
console.log(uom.format(100, 'fluid-ounce)) // 100oz
```

[See the UOM documentation](src/uom/README.md)

---

## Links

- [Nomie Website - nomie.app](https://nomie.app)
- [Nomie v5 Web App - v5.nomie.app](https://v5.nomie.app)
- [Nomie Web App Source - github.com/open-nomie/nomie](https://github.com/open-nomie/nomie)
- [Reddit Community - reddit.com/r/nomie](https://reddit.com/r/nomie)
- [Twitter - twitter.com/nomieapp](https://twitter.com/nomieapp)

---

Trademark License
Nomie and the Blue Elephant are registered Trademarks of Happy Data, LLC. Indianapolis, IN. For a commercial use of the brand or logomark please contact support@happydata.org

MIT License
Copyright 2019 Happy Data, LLC support@happydata.org

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
