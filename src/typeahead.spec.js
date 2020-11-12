// import { typeahead } from './typeahead-standalone';
import { NOOP, normalizer } from './helpers';

describe('Typeahead Standalone', () => {
  describe('Normalizer', () => {
    it('Input as empty array', () => {
      const colors = [];
      const result = normalizer(colors);
      expect(result).toEqual(colors);
    });

    it('Input as string array', () => {
      const colors = ['Red', 'Blue', 'Blue Dark', 'Blue Darker'];
      const result = normalizer(colors);
      expect(result).toEqual([{ label: 'Red' }, { label: 'Blue' }, { label: 'Blue Dark' }, { label: 'Blue Darker' }]);
    });

    it('Input as object array, missing identifier + label', () => {
      var colors = [
        { id: 'Red', value: 'RD', hash: 'red' },
        { id: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
        { id: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
        { id: 'Blue Darker', value: 'DBL', hash: 'midnightblue', group: 'Shades of Blue' },
      ];

      const result = normalizer(colors);

      expect(result).toEqual([
        { label: '{"id":"Red","value":"RD","hash":"red"}' },
        { label: '{"id":"Blue","value":"BL","hash":"blue","group":"Shades of Blue"}' },
        { label: '{"id":"Blue Dark","value":"DBL","hash":"darkblue","group":"Shades of Blue"}' },
        { label: '{"id":"Blue Darker","value":"DBL","hash":"midnightblue","group":"Shades of Blue"}' },
      ]);
    });

    it('Input as object array with identifier', () => {
      var colors = [
        { id: 'Red', value: 'RD', hash: 'red' },
        { id: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
        { id: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
        { id: 'Blue Darker', value: 'DBL', hash: 'midnightblue', group: 'Shades of Blue' },
      ];

      const result = normalizer(colors, 'id');

      expect(result).toEqual([
        { label: 'Red', id: 'Red', value: 'RD', hash: 'red' },
        { label: 'Blue', id: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
        { label: 'Blue Dark', id: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
        { label: 'Blue Darker', id: 'Blue Darker', value: 'DBL', hash: 'midnightblue', group: 'Shades of Blue' },
      ]);
    });

    it('Input as normalized object array', () => {
      var colors = [
        { label: 'Red', value: 'RD', hash: 'red' },
        { label: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
        { label: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
        { label: 'Blue Darker', value: 'DBL', hash: 'midnightblue', group: 'Shades of Blue' },
      ];

      const result = normalizer(colors);
      expect(result).toEqual(colors);
    });
  });
});
