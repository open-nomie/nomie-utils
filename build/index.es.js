var time = {
    padTime: function (t) {
        return (t + '').length === 1 ? (t + '').padStart(2, '0') : t;
    },
    // Seconds to Time Chunk "03:30:30"
    secondsToTime: function (secondsStr) {
        var _seconds = typeof secondsStr == 'string' ? parseInt(secondsStr) : secondsStr;
        var seconds = '';
        var minutes = Math.floor(_seconds / 60).toString();
        var hours = '';
        if (parseInt(minutes) > 59) {
            hours = this.padTime(Math.floor(parseInt(minutes) / 60).toString());
            minutes = this.padTime((parseInt(minutes) - parseInt(hours) * 60).toString());
        }
        seconds = this.padTime(Math.floor(_seconds % 60).toString());
        minutes = this.padTime(minutes);
        if (hours !== '') {
            return this.padTime(hours) + ":" + minutes + ":" + seconds;
        }
        else {
            return "00:" + minutes + ":" + seconds;
        }
    },
    msToSecond: function (ms) {
        return ms / 1000;
    },
    timestringToSeconds: function (timestring) {
        var tsa = timestring.split(':');
        return this.unitsToSeconds(tsa[0], tsa[1], tsa[2]);
    },
    unitsToSeconds: function (hour, minutes, seconds) {
        var s = 0;
        s = (parseInt(hour) || 0) * 60 * 60;
        s = s + (parseInt(minutes) || 0) * 60;
        s = s + (parseInt(seconds) || 0);
        return s;
    },
};

/**
 * getValueString
 * Returns a value string from #tracker(value)
 * @param {String} word
 */
function getValueString(word) {
    var wordSplit = word.split('(');
    var value = wordSplit.length == 2 ? wordSplit[1].replace(')', '') : '1';
    value = value.length ? value : '1';
    return parseStringValue(value);
}
/**
 * Parse String Value
 * Convert a string into a value, or a time string 01:03:44 into seconds
 * @param valueStr String
 */
function parseStringValue(valueStr) {
    if (valueStr.split('.').length == 2) {
        return parseFloat(valueStr);
    }
    else if (valueStr.search(':') > -1) {
        return time.timestringToSeconds(valueStr);
    }
    else {
        return parseInt(valueStr);
    }
}
/**
 * Scrub
 * Removes common word ending characters
 * @param {String} word
 */
function scrub(word) {
    var cleanedWord = word.replace(/(\'|\,|\.|\!|’|\?|:)/gi, '');
    return {
        word: cleanedWord,
        remainder: word.replace(cleanedWord, '')
    };
}
/**
 * toToken
 * Creates a payload that can be turned into a
 * @param {String} type tracker,context,person,generic
 * @param {String} word
 * @param {String} value
 * @param {String} remainder
 */
var prefixes = { context: '+', person: '@', tracker: '#' };
function toToken(type, word, value, remainder, raw) {
    if (value === void 0) { value = ''; }
    if (remainder === void 0) { remainder = ''; }
    var prefix = prefixes[type] || '';
    var id = (word.search(/\(/) > -1
        ? word.replace(prefix, '').split('(')[0]
        : word.replace(prefix, '')).toLowerCase();
    raw = raw || word || '';
    return {
        id: id,
        raw: raw,
        prefix: prefix,
        type: type,
        value: value,
        remainder: remainder //any trailing words
    };
}
/**
 * Parse
 * parses a string and returns an array of
 * elements
 * @param {String} str
 */
function parse(str) {
    // Split it into an array of lines
    var lines = str.split(/\r?\n/);
    var final = [];
    // Loop over each line
    lines.forEach(function (line) {
        // Extract
        var tokens = parseStr(line);
        tokens.forEach(function (token) {
            final.push(token);
        });
        // Add the line Break
        if (lines.length > 1) {
            final.push(toToken('line-break', ''));
        }
    });
    // Return parsed note
    return final;
}
/**
 * Sum all numbers in an array
 * @param nums Array
 */
function sum(nums) {
    return nums.reduce(function (a, b) {
        return a + b;
    }, 0);
}
/**
 * Average all numbers in an array
 * @param nums Array
 */
function average(nums) {
    var total = nums.reduce(function (acc, c) { return acc + c; }, 0);
    return total / nums.length;
}
/**
 * Deep Tokenization
 * Parse, and calculate base stats
 * @param nums Array
 */
function deep(str) {
    var tokens = parse(str);
    var response = stats(tokens);
    response.tokens = tokens;
    return response;
}
/**
 * Parse a Line to an array.
 * @param {String} str
 */
function parseStr(str) {
    var wordArray = str.trim().split(' ');
    return (
    // Split on the space
    wordArray
        .map(function (word) {
        // Loop over each word
        var scrubbed = scrub(word); // Scrub it clean
        var valueStr = getValueString(word);
        var firstChar = word.trim().substr(0, 1);
        // switch on first character
        if (firstChar === '#') {
            if (word.match(/\d\d:\d\d/)) {
                // if it's a timer
                return toToken('tracker', word, valueStr, scrubbed.remainder.replace(word, ''));
            }
            else {
                return toToken('tracker', scrubbed.word, valueStr, scrubbed.remainder.replace(word, ''));
            }
        }
        else if (firstChar === '@') {
            return toToken('person', scrubbed.word.toLowerCase(), valueStr, scrubbed.remainder);
        }
        else if (firstChar === '+') {
            return toToken('context', scrubbed.word, valueStr, scrubbed.remainder);
        }
        else if (word.search(/https:|http:/) > -1) {
            return toToken('link', word.trim().replace(/(https|http):\/\//gi, ''), null, null, word.trim());
        }
        else if (word) {
            return {
                id: "" + word,
                type: 'generic',
                raw: "" + word,
                prefix: null,
                remainder: null
            };
        }
        return null;
    })
        .filter(function (word) { return word; }));
} // end parse string
/**
 * Stats
 * Generate stats for a set of tokens
 * @param tokens Array
 */
function stats(tokens) {
    var map = {
        trackers: {},
        people: {},
        context: {}
    };
    // Loop over tokens
    tokens.forEach(function (token) {
        // If its a tracker - do tracker things
        if (token.type == 'tracker') {
            map.trackers[token.id] =
                map.trackers[token.id] || Object.assign(token, {});
            map.trackers[token.id].values = map.trackers[token.id].values || [];
            map.trackers[token.id].values.push(token.value);
        }
        else {
            // Map person to people if needed
            var type = token.type == 'person' ? 'people' : token.type;
            // Setup map for type
            map[type] = map[type] || {};
            map[type][token.id] = map[type][token.id] || Object.assign(token, {});
            map[type][token.id].values = map[type][token.id].values || [];
            map[type][token.id].values.push(1);
        }
    });
    // Create a Map for Results
    var results = {
        trackers: [],
        context: [],
        people: []
    };
    // Loop over the map to do final filtering
    Object.keys(map).forEach(function (type) {
        var items = map[type];
        // Loop over items for this type
        results[type] = Object.keys(items).map(function (id) {
            var token = items[id];
            token.sum = sum(token.values);
            token.avg = average(token.values);
            return token;
        });
    });
    var response = results;
    response.words = tokens.length;
    return response;
}
var tokenizeDeep = deep;
var tokenize = function (str) {
    if (str === void 0) { str = ''; }
    return parse(str);
};

export { tokenize, tokenizeDeep };
//# sourceMappingURL=index.es.js.map
