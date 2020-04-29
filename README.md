# Nomie Utils

This library contains a set of node / browser javascript utilities that are used to power Nomie. They've been broken out of the app to allow for easier integration into other systems.

## What's Nomie?

An [Open Source Life Tracker / Mood Tracker / Data Journal](https://nomie.app/) that runs as a PWA / Web App and is completely private using either device only storage, or Blockstack.

![](https://shareking.s3.amazonaws.com/pb-l3LHnDdC5H-1586728691.png)

## Install

```
npm install nomie-utils
```

## Note Tokenizer

Nomie stores all data for record as a single note. For example `Today I #walked(4) with @mom and @data #mood(6.7) +family` and then parses that note into structured data.

### Tokenizer

```
import { tokenize } from "nomie-utils";

const note = "I'm @brandon, this is a #tracker(20) +testing";
const tokens = tokenize(note);
console.log(tokens);
```

#### Returns an array of tokens

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

#### A Token Object

- **id**: an ID safe version of the word
- **value**: The value provided. E.g. the 6 in #walked(6)
- **raw**: the original word
- **type**: the type (tracker|context|person|link|line-break|generic)
- **prefix**: trigger character (#|+|@)
  -- **remainder**: Any trailing special characters. For example the "," in "@brandon,"

### Tokenizer Deep (grouped with sums and average)

If you'd like to automatically group trackers, people and context, and sum / avg their values, use the `tokenizerDeep` method. This will not only parse the results, but return deeper context on their totals and usage.

```
import { tokenizeDeep } from "nomie-utils";

const note = "Hi I'm @brandon! #jump(20) #jump(10) #walk +testing";
const tokens = tokenizeDeep(note);
console.log(tokens);
```

Returns

```
{
    tokens: [...Array of tokens],
    trackers: [
        { id: "jump", type:"tracker", sum: 30, avg: 15, ...token}
        { id: "walk", type:"tracker", sum: 1, avg: 1, ...token}
    ],
    context: [
        { id: "testing", type:"context", sum: 1, avg: 1, ...token}
    ],
    people: [
        { id: "brandon", type:"person", sum: 1, avg: 1, ...token}
    ],
    links: []
}
```

## Nomie UOM
