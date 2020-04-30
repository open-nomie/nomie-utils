'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var time = {
    padTime: function (t) {
        return (t + '').length === 1 ? (t + '').padStart(2, '0') : t;
    },
    // Seconds to Time Chunk "03:30:30"
    secondsToTime: function (secondsStr) {
        var _seconds = typeof secondsStr === 'string' ? parseInt(secondsStr) : secondsStr;
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
    }
};

var prefixes = { context: '+', person: '@', tracker: '#' };
/**
 * getValueString
 * Returns a value string from #tracker(value)
 * @param {String} word
 */
function getValueString(word) {
    var wordSplit = word.split('(');
    var value = wordSplit.length === 2 ? wordSplit[1].replace(')', '') : '1';
    value = value.length ? value : '1';
    return parseStringValue(value);
}
/**
 * Parse String Value
 * Convert a string into a value, or a time string 01:03:44 into seconds
 * @param valueStr String
 */
function parseStringValue(valueStr) {
    if (valueStr.split('.').length === 2) {
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
    var cleanedWord = word.replace(/(’s|'s|'|,|\.|!|’|\?|:)/gi, '');
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
    if (str === void 0) { str = ''; }
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

var remap = {
    tracker: 'trackers',
    person: 'people',
    link: 'links'
};
/**
 * Stats
 * Generate stats for a set of tokens
 * @param tokens Array
 */
function stats(tokens) {
    var map = {
        trackers: {},
        people: {},
        context: {},
        links: {}
    };
    // Loop over tokens
    tokens.forEach(function (token) {
        var type = Object.prototype.hasOwnProperty.call(remap, token.type)
            ? remap[token.type]
            : token.type;
        // set type if doesnt exist
        map[type] = map[type] || {};
        // Setup id in type, if not exist step to first token
        map[type][token.id] = map[type][token.id] || Object.assign(token, {});
        // Setup a holder vor the values
        map[type][token.id].values = map[type][token.id].values || [];
        // Push the value, or default to 1
        map[type][token.id].values.push(token.value || 1);
    });
    // Create a Map for Results
    var results = {
        trackers: [],
        context: [],
        people: [],
        links: []
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
/**
 * Deep Tokenization
 * Parse, and calculate base stats
 * @param nums Array
 */
function deep(str) {
    var tokens = parse(str);
    var response = stats(tokens);
    response.tokens = tokens;
    // Return selectors
    response.get = function (type, id) {
        type = Object.prototype.hasOwnProperty.call(remap, type)
            ? remap[type]
            : type;
        return Object.prototype.hasOwnProperty.call(response, type)
            ? response[type].find(function (t) { return t.id === id; })
            : null;
    };
    return response;
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

var UOMS = {
    num: {
        singular: 'Count',
        plural: 'Count',
        symbol: 'count',
        type: 'general'
    },
    reps: {
        singular: 'Rep',
        plural: 'Reps',
        symbol: 'reps',
        type: 'general'
    },
    percent: {
        singular: 'Percent',
        plural: 'Percent',
        symbol: '%',
        type: 'general',
        symbolAffix: 'post'
    },
    dollars: {
        singular: 'Dollar',
        plural: 'Dollars',
        symbol: '$',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '$' + v.toFixed(2);
        }
    },
    peso: {
        singular: 'Peso',
        plural: 'Peso',
        symbol: '$',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '$' + v.toFixed(2);
        }
    },
    franc: {
        singular: 'Franc',
        plural: 'Francs',
        symbol: 'Fr.',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return 'Fr. ' + v.toFixed(2);
        }
    },
    cpound: {
        singular: 'Pound',
        plural: 'Pounds',
        symbol: '£',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '£' + v.toFixed(2);
        }
    },
    rupee: {
        singular: 'Rupee',
        plural: 'Rupees',
        symbol: 'Rs.',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return 'Rs. ' + v.toFixed(2);
        }
    },
    yen: {
        singular: 'Yen',
        plural: 'Yen',
        symbol: '¥',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '¥' + v.toFixed(2);
        }
    },
    yuan: {
        singular: 'Yuan',
        plural: 'Yuan',
        symbol: '¥',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '¥' + v.toFixed(2);
        }
    },
    bitcoin: {
        singular: 'Bitcoin',
        plural: 'Bitcoins',
        type: 'currency',
        symbolAffix: 'pre',
        symbol: 'B'
    },
    euro: {
        singular: 'Euro',
        plural: 'Euros',
        symbol: '€',
        type: 'currency',
        symbolAffix: 'pre',
        display: function (v) {
            return '€' + v.toFixed(2);
        }
    },
    timer: {
        singular: 'Time',
        plural: 'Time',
        symbol: 'time',
        type: 'Timer',
        symbolAffix: 'post',
        symbolSpace: false,
        display: function (v) {
            var secNum = parseInt(v, 10); // don't forget the second param
            var hours = Math.floor(secNum / 3600);
            var minutes = Math.floor((secNum - hours * 3600) / 60);
            var seconds = secNum - hours * 3600 - minutes * 60;
            return !hours
                ? minutes + 'm ' + seconds + 's'
                : hours + 'h ' + minutes + 'm';
        }
    },
    sec: {
        singular: 'Second',
        plural: 'Seconds',
        symbol: 'secs',
        type: 'time',
        symbolAffix: 'post',
        symbolSpace: true,
        display: function (v) {
            if (v < 3600) {
                return v + 's';
            }
            else {
                return Math.round((v / 60) * 100) / 100 + 'm';
            }
        }
    },
    min: {
        singular: 'Minute',
        plural: 'Minutes',
        symbol: 'm',
        type: 'time',
        symbolAffix: 'post',
        symbolSpace: false,
        display: function (v) {
            if (v < 60) {
                return v + 'm';
            }
            else if (v > 60 && v < 1441) {
                return Math.round((v / 60) * 100) / 100 + 'h';
            }
            else if (v > 1440 && v < 10000) {
                return (v / 1440).toFixed(0) + 'd';
            }
            else {
                return (v / 1440).toFixed(0) + 'd';
            }
        }
    },
    hour: {
        singular: 'Hour',
        plural: 'Hours',
        symbol: 'hrs',
        type: 'time',
        symbolAffix: 'post',
        symbolSpace: false,
        display: function (v) {
            if (v < 168) {
                return Math.round(v * 100) / 100 + 'h';
            }
            else {
                return (v / 24).toFixed(0) + 'd';
            }
        }
    },
    day: {
        singular: 'Day',
        plural: 'Days',
        symbol: 'days',
        type: 'time'
    },
    mm: {
        singular: 'Millimeter',
        plural: 'Millimeters',
        symbol: 'mm',
        type: 'distance'
    },
    cm: {
        singular: 'Centimeter',
        plural: 'Centimeters',
        symbol: 'cm',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    meter: {
        singular: 'Meter',
        plural: 'Meter',
        symbol: 'm',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    km: {
        singular: 'Kilometer',
        plural: 'Kilometers',
        symbol: 'km',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    inch: {
        singular: 'Inch',
        plural: 'Inches',
        symbol: 'in',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    degrees: {
        singular: 'Degree',
        plural: 'Degrees',
        symbol: '°',
        type: 'temperature',
        symbolAffix: 'post',
        symbolSpace: false
    },
    celsius: {
        singular: 'Celsius',
        plural: 'Celsius',
        symbol: '°C',
        type: 'temperature',
        symbolAffix: 'post',
        symbolSpace: false
    },
    fahrenheit: {
        singular: 'Fahrenheit',
        plural: 'Fahrenheit',
        symbol: '°F',
        type: 'temperature',
        symbolAffix: 'post',
        symbolSpace: false
    },
    foot: {
        singular: 'Foot',
        plural: 'Feet',
        symbol: 'ft',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    yard: {
        singular: 'Yard',
        plural: 'Yards',
        symbol: 'yrds',
        type: 'distance',
        symbolAffix: 'post',
        symbolSpace: true
    },
    mile: {
        singular: 'Mile',
        plural: 'Miles',
        symbol: 'mi',
        type: 'distance',
        symbolAffix: 'post'
    },
    mg: {
        singular: 'Milligram',
        plural: 'Milligrams',
        symbol: 'mg',
        type: 'weight',
        symbolAffix: 'post'
    },
    gram: {
        singular: 'Gram',
        plural: 'Grams',
        symbol: 'g',
        type: 'weight',
        symbolAffix: 'post'
    },
    kg: {
        singular: 'Kilogram',
        plural: 'Kilograms',
        symbol: 'kg',
        type: 'weight',
        symbolAffix: 'post'
    },
    stone: {
        singular: 'Stone',
        plural: 'Stones',
        symbol: 'st',
        type: 'weight'
    },
    oz: {
        singular: 'Ounce',
        plural: 'Ounces',
        symbol: 'oz',
        type: 'weight',
        symbolAffix: 'post',
        symbolSpace: true
    },
    pound: {
        singular: 'Pound',
        plural: 'Pounds',
        symbol: 'lbs',
        type: 'weight',
        symbolAffix: 'post',
        symbolSpace: true
    },
    cup: {
        singular: 'Cup',
        plural: 'Cups',
        symbol: 'cups',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: true
    },
    fluidounce: {
        singular: 'Fluid Ounce',
        plural: 'Fluid Ounces',
        symbol: 'oz',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: true
    },
    pint: {
        singular: 'Pint',
        plural: 'Pints',
        symbol: 'pint',
        type: 'volume'
    },
    quart: {
        singular: 'Quart',
        plural: 'Quarts',
        symbol: 'qt',
        type: 'volume',
        symbolAffix: 'post'
    },
    gallon: {
        singular: 'Gallon',
        plural: 'Gallons',
        symbol: 'gal',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: true
    },
    liter: {
        singular: 'Liter',
        plural: 'Liters',
        symbol: 'L',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: false
    },
    milliliter: {
        singular: 'Milliliter',
        plural: 'Milliliters',
        symbol: 'ml',
        type: 'volume',
        symbolAffix: 'post',
        symbolSpace: false
    }
};

function main() {
    /**
     * Array of UOMS
     */
    function toArray() {
        return Object.keys(UOMS).map(function (key) {
            var obj = UOMS[key];
            obj.key = key;
            return obj;
        });
    }
    /**
     * Map of UOMS grouped by type
     * { general: [], volume: []...}
     */
    function toGroupedArray() {
        var items = {};
        Object.keys(UOMS).forEach(function (key) {
            var obj = UOMS[key];
            obj.key = key;
            items[obj.type] = items[obj.type] || [];
            items[obj.type].push(obj);
        });
        return items;
    }
    /**
     * Format a value to a UOM's display
     * @param value Number
     * @param key String
     * @param includeUnit boolean
     */
    function format(value, key, includeUnit) {
        if (includeUnit === void 0) { includeUnit = true; }
        if (Object.prototype.hasOwnProperty.call(UOMS, key) && !isNaN(value)) {
            var symbol = UOMS[key].symbol;
            var affix = UOMS[key].symbolAffix;
            var space = UOMS[key].symbolSpace || false ? ' ' : '';
            // Get display formatter for key if one exists.
            var displayFormatter = UOMS[key].display || null;
            // Does the UOM have it's own display formatter?
            if (displayFormatter) {
                return displayFormatter(value); // displayFormatter(v);
            }
            else {
                if (!isNaN(parseFloat(value)) && isFinite(value) && value !== 0) {
                    value = addCommas(value);
                }
                if (affix && symbol && includeUnit) {
                    if (affix === 'pre') {
                        return symbol + space + value;
                    }
                    else {
                        return value + space + symbol;
                    }
                }
                else {
                    return value;
                }
            } // end if the uom has it's own display
        }
        else {
            return value;
        }
    }
    /**
     * Plural
     * @param key string
     */
    function plural(key) {
        return Object.prototype.hasOwnProperty.call(UOMS, key)
            ? UOMS[key].plural
            : key;
    }
    /**
     * Singular
     * @param key string
     */
    function singular(key) {
        return Object.prototype.hasOwnProperty.call(UOMS, key)
            ? UOMS[key].singular
            : key;
    }
    /**
     * Abreviation
     * @param key string
     */
    function abv(key) {
        return Object.prototype.hasOwnProperty.call(UOMS, key)
            ? UOMS[key].symbol
            : null;
    }
    /**
     * Add Comma to a number
     * @param base number
     */
    function addCommas(base) {
        if (base === void 0) { base = 0; }
        var num = "" + base;
        var x = num.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    return {
        toArray: toArray,
        toGroupedArray: toGroupedArray,
        plural: plural,
        singular: singular,
        abv: abv,
        format: format,
        addCommas: addCommas
    };
}
var uom = main();

exports.tokenize = parse;
exports.tokenizeDeep = deep;
exports.uom = uom;
//# sourceMappingURL=index.js.map
