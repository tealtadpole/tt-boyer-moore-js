const bm = require('./index.js')

test('Booyer Moore string search test', () => {
    const text = 'this is random sentence'
    const pattern = 'random'
    expect(bm.boyerMooreSearch(text, pattern)).toBe(8);
});
 