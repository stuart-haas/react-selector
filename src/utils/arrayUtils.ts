export function chunks(array: any, size: number) {
    if (!Array.isArray(array)) {
      throw new TypeError('Input should be Array');
    }
  
    if (typeof size !== 'number') {
      throw new TypeError('Size should be a Number');
    }
  
    var result = [];
    for (var i = 0; i < array.length; i += size) {
      result.push(array.slice(i, size + i));
    }
  
    return result;
}

export function transform(array: any, keys: any) {
    return array.map((item: any, index: number) => {
        let obj = keys.map((key:any) => {
            return {[key] : item[key]}
        })
        return Object.assign({}, ...obj)
    })
}

export function wrap(array: any, key: string) {
    return array.map((item: any, index: number) => {
        return { [key] : item }
    })
}

export function flatten(array: any, key: string) {
    return array.map((item: any, index: number) => {
        return item[key]
    })
}

export function pick(o, ...props) {
    return Object.assign({}, ...props.map(prop => ({[prop]: o[prop]})));
}

export function dedupe(array: any) {
    return array.filter((item: any, index: number) => {
        return array.indexOf(item) == index
    })
}

export function groupBy(array: any, key: string) {
    return array.reduce((result: any, currentValue: any) => {
        (result[currentValue[key]]= result[currentValue[key]] || []).push(
            currentValue
        )
        return result
    }, {})
}

export function filterBy(array: any, key: string, value: any, compare: Function = equals) {
    return array.filter((item: any) => {
        return compare(item[key], value)
    })
}

export function merge(array: any, key: string, keys: any, join: string) {
    return array.map(item => {
        const merge = keys.map(key => {
            return item[key]
        })
        item[key] = merge.join(join)
        return item
    })
}

export function sortBy(array: any, key: string, compare: Function = sortAsc) {
    return array.sort((a: any, b: any) => compare(a[key], b[key]))
}

export function includes(a: any, array: any) {
    return array.includes(a)
}

export function sortAsc(a: any, b: any) { return (a > b) ? 1 : -1 }

export function sortDesc(a: any, b: any) { return (a < b) ? 1 : -1 }

export function equals(a: any, b: any) { return a == b; }

export function notEquals(a: any, b: any) { return a !== b; }

export function toUpper(x: any) { 
    return x.toUpperCase();
}