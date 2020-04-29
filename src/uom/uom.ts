import UOMS from './uom.config'

function main() {
  /**
   * Array of UOMS
   */
  function toArray(): Array<any> {
    return Object.keys(UOMS).map((key) => {
      let obj = UOMS[key]
      obj.key = key
      return obj
    })
  }

  /**
   * Map of UOMS grouped by type
   * { general: [], volume: []...}
   */
  function toGroupedArray(): any {
    let items = {}
    Object.keys(UOMS).forEach((key) => {
      let obj = UOMS[key]
      obj.key = key
      items[obj.type] = items[obj.type] || []
      items[obj.type].push(obj)
    })
    return items
  }

  /**
   * Format a value to a UOM's display
   * @param value Number
   * @param key String
   * @param includeUnit boolean
   */
  function format(
    value: any,
    key: string,
    includeUnit: boolean = true
  ): string {
    if (UOMS.hasOwnProperty(key) && !isNaN(value)) {
      let symbol = UOMS[key].symbol
      let affix = UOMS[key].symbolAffix
      let space = UOMS[key].symbolSpace || false ? ' ' : ''
      // Get display formatter for key if one exists.
      let displayFormatter = UOMS[key].display || null
      // Does the UOM have it's own display formatter?
      if (displayFormatter) {
        return displayFormatter(value) // displayFormatter(v);
      } else {
        if (!isNaN(parseFloat(value)) && isFinite(value) && value !== 0) {
          value = addCommas(value)
        }
        if (affix && symbol && includeUnit) {
          if (affix == 'pre') {
            console.log('Affix it!')
            return symbol + space + value
          } else {
            return value + space + symbol
          }
        } else {
          return value
        }
      } // end if the uom has it's own display
    } else {
      return value
    }
  }

  /**
   * Plural
   * @param key string
   */
  function plural(key: string): string {
    return UOMS.hasOwnProperty(key) ? UOMS[key].plural : key
  }

  /**
   * Singular
   * @param key string
   */
  function singular(key: string): string {
    return UOMS.hasOwnProperty(key) ? UOMS[key].singular : key
  }

  /**
   * Abreviation
   * @param key string
   */
  function abv(key: string): any {
    return UOMS.hasOwnProperty(key) ? UOMS[key].symbol : null
  }

  /**
   * Add Comma to a number
   * @param base number
   */
  function addCommas(base: number = 0): string {
    let num: string = `${base}`
    let x = num.split('.')
    let x1 = x[0]
    let x2 = x.length > 1 ? '.' + x[1] : ''
    let rgx = /(\d+)(\d{3})/
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2')
    }
    return x1 + x2
  }

  return {
    toArray,
    toGroupedArray,
    plural,
    singular,
    abv,
    format,
    addCommas
  }
}

export default main()
