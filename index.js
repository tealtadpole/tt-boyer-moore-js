const makeBadCharTable = (pattern) => {
    // javascript charCodeAt has maximum value of 65535, which from 2^16 - 1
    // so we can only make our table from index 0 to 65535
    const table = Array(65536).fill(pattern.length)
    
    // update table for each matching character
    for(let i=0; i<pattern.length-1; i++) {
        table[pattern.charCodeAt(i)] = pattern.length - 1 - i
    }
    return table
}
const isPrefix = (pattern, index) => {
    for (let i=index, j=0; i<pattern.length; i++, j++) {
        return (pattern[i] === pattern[j])
    }
}

const suffixLength = (pattern, index) => {
    let len=0;
    for (let i=index, j=pattern.length - 1; i>= 0 && pattern[i] === pattern[j]; i--, j--) {
        len += 1
    }
    return len;
} 

const makeGoodSuffixTable = (pattern) => {
    let table = Array(pattern.length).fill(0)
    let prefixIndex = pattern.length;

    for (let i=pattern.length; i > 0; i--) {
        if (isPrefix(pattern, i)) {
            prefixIndex = i
        }
        table[pattern.length - i] = prefixIndex - 1 + pattern.length
    }
    
    for (let i=0; i<pattern.length - 1; i++) {
        const suffLength = suffixLength(pattern, i)
        table[suffLength] = pattern.length - 1 - i + suffLength
        table[suffLength] = table[suffLength] > pattern.length ? pattern.length : table[suffLength]
    }
    return table
}

const boyerMooreSearch = (text, pattern, index = 0) => {
    if (typeof text !== 'string' || typeof pattern !== 'string') return -1

    const startIndex = Math.floor(index < 0 ? 0 : index)

    if (pattern === "") {
        return startIndex < text.length ? startIndex : text.length
    }
    let charTable = makeBadCharTable(pattern);
    let offsetTable = makeGoodSuffixTable(pattern);
    
    for (let i=pattern.length - 1 + Math.floor(startIndex); i < text.length; ) {
        let j = pattern.length - 1
        while (pattern[j] === text[i]) {
            if (j === 0) return i
            i--
            j--
        }

        const charCode = text.charCodeAt(i);
        const deltai = Math.max(offsetTable[pattern.length - 1 - j], charTable[charCode])
        i+= deltai
    }
    return -1;
}

module.exports = {
    boyerMooreSearch
}
