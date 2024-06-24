import { expect } from 'vitest';
import { normalizer } from './helpers.js';

const colorsObj = [
  { id: 'Red', value: 'RD', hash: 'red' },
  { id: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { id: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { id: 'Blue Darker', value: 'DBL', hash: 'midnightblue', group: 'Shades of Blue' },
];
const colorsStr = ['Red', 'Blue', 'Blue Dark', 'Blue Darker'];

describe('Typeahead Standalone', () => {
  describe('Normalizer', () => {
    test('Input as empty array', () => {
      const result = normalizer([]);
      expect(result).toEqual([]);
    });

    test('Input as string array with no keys', () => {
      const result = normalizer(colorsStr);
      // keys are undefined
      expect(result).toEqual([
        { undefined: 'Red' },
        { undefined: 'Blue' },
        { undefined: 'Blue Dark' },
        { undefined: 'Blue Darker' },
      ]);
    });

    test('Input as string array with given key', () => {
      const result = normalizer(colorsStr, 'label');
      expect(result).toEqual([{ label: 'Red' }, { label: 'Blue' }, { label: 'Blue Dark' }, { label: 'Blue Darker' }]);
    });

    test('Input as object array with key', () => {
      const result = normalizer(colorsObj, 'id');
      expect(result).toEqual(colorsObj);
    });

    test('Input as object array with missing/non-existent key should throw', () => {
      expect(() => normalizer(colorsObj, 'cle')).toThrow();
    });

    test('Input as object array with only a few items missing a key should throw', () => {
      const colors = [
        ...colorsObj,
        ...[
          { name: 'orange', value: 'OR' },
          { name: 'yellow', value: 'TW' },
        ],
      ];
      expect(() => normalizer(colors, 'id')).toThrow();
    });

    it('Should throw when input is an array of objects + no key is given', () => {
      expect(() => normalizer(colorsObj)).toThrow();
    });
  });
});
