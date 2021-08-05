// Copyright 2008 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Flags: --allow-natives-syntax

const bm = require('./index.js')
const searchFunction = bm.boyerMooreSearch

test('basic string search', () => {

  var s = "test test test"
  console.log('start basic string search')
  expect(searchFunction(s, "t")).toBe(0)
  expect(searchFunction(s, "t", 1)).toBe(3)
  expect(searchFunction(s, "t", 4)).toBe(5)
  expect(searchFunction(s, "t", 4.1)).toBe(5)
  expect(searchFunction(s, "t", 0)).toBe(0)
  expect(searchFunction(s, "t", -1)).toBe(0)
  expect(searchFunction(s, "t", -1.1)).toBe(0)
  expect(searchFunction(s, "t", -1073741825)).toBe(0)
  expect(searchFunction(s, "e")).toBe(1)
  expect(searchFunction(s, "s")).toBe(2)

  expect(searchFunction(s, "test", 4)).toBe(5)
  expect(searchFunction(s, "test", 5)).toBe(5)
  expect(searchFunction(s, "test", 6)).toBe(10)
  expect(searchFunction(s, "test", 0)).toBe(0)
  expect(searchFunction(s, "test", 0.0)).toBe(0)
  expect(searchFunction(s, "test", -1)).toBe(0)
  expect(searchFunction(s, "not found", -1)).toBe(-1)
  expect(searchFunction(s, "test", -1.0)).toBe(0)
  expect(searchFunction(s, "test", -1073741825)).toBe(0)
  expect(searchFunction(s, "test")).toBe(0)
  expect(searchFunction(s, "notpresent")).toBe(-1)
  expect(searchFunction(s)).toBe(-1)

  for (var i = 0; i < s.length+10; i++) {
    var expected = i < s.length ? i : s.length;
    expect(searchFunction(s, "", i)).toBe(expected);
  }
})

test('complex string', () => {
  console.log('start complex string search')
  var reString = "asdf[a-z]+(asdf)?";

  expect(searchFunction(reString, "[a-z]+")).toBe(4)
  expect(searchFunction(reString, "(asdf)?")).toBe(10)
  
})

test('Two bytes string test', () => {
  console.log('start two bytes string test')
  // Random greek letters
  var twoByteString = "\u039a\u0391\u03a3\u03a4\u0395";

  // Test single char pattern
  expect(searchFunction(twoByteString, "\u039a")).toBe(0)
  expect(searchFunction(twoByteString, "\u0391")).toBe(1)
  expect(searchFunction(twoByteString, "\u03a3")).toBe(2)
  expect(searchFunction(twoByteString, "\u03a4", 3)).toBe(3)
  expect(searchFunction(twoByteString, "\u0395")).toBe(4)
  expect(searchFunction(twoByteString, "\u0392")).toBe(-1)

  // Test multi-char pattern
  expect(searchFunction(twoByteString, "\u039a\u0391")).toBe(0)
  expect(searchFunction(twoByteString, "\u0391\u03a3")).toBe(1)
  expect(searchFunction(twoByteString, "\u03a3\u03a4")).toBe(2)
  expect(searchFunction(twoByteString, "\u03a4\u0395")).toBe(3)

  expect(searchFunction(twoByteString, "\u0391\u03a3\u0395")).toBe(-1)

  expect(searchFunction(twoByteString, "\u0395")).toBe(4)
})

test('test string with alignment traps', () => {
  console.log('start test string with alignment traps')
  var alignmentString = "\u1122\u2211\u2222\uFF00\u00FF\u00FF";
  expect(searchFunction(alignmentString, "\u2222")).toBe(2)
  expect(searchFunction(alignmentString, "\u00FF\u00FF")).toBe(4)

  var longAlignmentString = "\uFF00" + "\u00FF".repeat(10);
  expect(searchFunction(longAlignmentString, "\u00FF".repeat(10))).toBe(1)

  // test string with first character match at the end
  var boundsString = "112233";
  expect(searchFunction(boundsString, "334455")).toBe(-1)
  expect(searchFunction(boundsString, "334455".repeat(10))).toBe(-1)
})


test('Test complex string indexOf algorithms. Only trigger for long strings.', () => {
  console.log('start Test complex string indexOf algorithms. Only trigger for long strings.')
  // Long string that isn't a simple repeat of a shorter string.
  var long = "A";
  for(var i = 66; i < 76; i++) {  // from 'B' to 'K'
    long =  long + String.fromCharCode(i) + long;
  }

  // pattern of 15 chars, repeated every 16 chars in long
  var pattern = "ABACABADABACABA";
  for(var i = 0; i < long.length - pattern.length; i+= 7) {
    var index = long.indexOf(pattern, i);
    expect(searchFunction(long, pattern, i)).toBe((i + 15) & ~0xf)
  }
  expect(searchFunction(long, "AJABACA")).toBe(510)
  expect(searchFunction(long, "AJABACA", 511)).toBe(1534)

  pattern = "JABACABADABACABA";
  expect(searchFunction(long, pattern)).toBe(511)
  expect(searchFunction(long, pattern, 512)).toBe(1535)

})

test('Search for a non-ASCII string in a pure ASCII string.', () => {
  console.log('start Search for a non-ASCII string in a pure ASCII string.')
  var asciiString = "arglebargleglopglyfarglebargleglopglyfarglebargleglopglyf";
  expect(searchFunction(asciiString, "\x2061")).toBe(-1)

  // Search in string containing many non-ASCII chars.
  var allCodePoints = [];
  for (var i = 0; i < 65536; i++) allCodePoints[i] = i;
  var allCharsString = String.fromCharCode.apply(String, allCodePoints);
  // Search for string long enough to trigger complex search with ASCII pattern
  // and UC16 subject.
  expect(searchFunction(allCharsString, "notfound")).toBe(-1)

  // Find substrings.
  var lengths = [1, 4, 15];  // Single char, simple and complex.
  var indices = [0x5, 0x65, 0x85, 0x105, 0x205, 0x285, 0x2005, 0x2085, 0xfff0];
  for (var lengthIndex = 0; lengthIndex < lengths.length; lengthIndex++) {
    var length = lengths[lengthIndex];
    for (var i = 0; i < indices.length; i++) {
      var index = indices[i];
      var pattern = allCharsString.substring(index, index + length);
      expect(searchFunction(allCharsString, pattern)).toBe(index)
    }
  }
})
