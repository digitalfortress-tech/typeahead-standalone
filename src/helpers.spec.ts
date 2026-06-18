import { describe, expect, test } from 'vitest';
import { diacritics, escapeHtml, escapeRegExp, getNestedValue, isObject, isString, spaceTokenizer } from './helpers.js';

describe('helpers', () => {
  describe('escapeHtml', () => {
    test('escapes HTML-significant characters', () => {
      expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
      // single quote (built via char code to avoid an apostrophe literal in source)
      expect(escapeHtml(String.fromCharCode(39))).toBe('&#39;');
    });

    test('leaves safe strings untouched and coerces non-strings', () => {
      expect(escapeHtml('plain text 123')).toBe('plain text 123');
      expect(escapeHtml(42)).toBe('42');
    });
  });

  describe('isObject', () => {
    test('recognises plain object literals', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    test('recognises null-prototype objects without throwing', () => {
      expect(isObject(Object.create(null))).toBe(true);
    });

    test('rejects non-plain values', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject('str')).toBe(false);
      expect(isObject(5)).toBe(false);
    });
  });

  describe('isString', () => {
    test('distinguishes strings from other values', () => {
      expect(isString('x')).toBe(true);
      expect(isString(1)).toBe(false);
      expect(isString({})).toBe(false);
    });
  });

  describe('getNestedValue', () => {
    test('reads a top-level key', () => {
      expect(getNestedValue({ label: 'Blue' }, 'label')).toBe('Blue');
    });

    test('reads a nested key via dot notation', () => {
      expect(getNestedValue({ a: { b: { c: 'deep' } } }, 'a.b.c')).toBe('deep');
    });

    test('returns empty string for a missing path', () => {
      expect(getNestedValue({ a: 1 }, 'a.b')).toBe('');
      expect(getNestedValue({}, 'x')).toBe('');
    });
  });

  describe('escapeRegExp', () => {
    test('escapes regex metacharacters', () => {
      expect(escapeRegExp('a.b*c')).toBe('a\\.b\\*c');
    });
  });

  describe('diacritics', () => {
    test('strips accents', () => {
      expect(diacritics('café résumé')).toBe('cafe resume');
    });

    test('defaults to empty string', () => {
      expect(diacritics()).toBe('');
    });
  });

  describe('spaceTokenizer', () => {
    test('splits on any whitespace run', () => {
      expect(spaceTokenizer('foo  bar\tbaz')).toEqual(['foo', 'bar', 'baz']);
    });
  });
});
