import type { Dictionary } from './common.d.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const NOOP = (...args: unknown[]): void => undefined;

export const escapeRegExp = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/**
 * Escapes HTML-significant characters so untrusted strings can be safely interpolated
 * into the HTML returned from a template callback (which is injected via innerHTML).
 * Use this around any consumer/remote data placed inside `templates.*` output.
 */
export const escapeHtml = (text: unknown): string =>
  `${text}`.replace(/[&<>"']/g, (ch) => {
    if (ch === '&') return '&amp;';
    if (ch === '<') return '&lt;';
    if (ch === '>') return '&gt;';
    if (ch === '"') return '&quot;';
    return '&#39;'; // single quote
  });

export const isObject = (item: unknown): item is Dictionary => {
  if (item === null || typeof item !== 'object') return false;
  // treat plain object literals and null-prototype objects as objects;
  // getPrototypeOf avoids throwing on Object.create(null) (which has no `.constructor`)
  const proto = Object.getPrototypeOf(item);
  return proto === Object.prototype || proto === null;
};

export const isString = (item: unknown): item is string => typeof item === 'string';

export const getNestedValue = (obj: unknown, selector: string): string => {
  let ref: unknown = obj;
  const keys = selector.split('.');

  for (const key of keys) {
    if (!isObject(ref) || !(key in ref)) {
      return '';
    }
    ref = ref[key];
  }

  return `${ref}`;
};

export const diacritics = (txt = '') => txt.normalize('NFD').replace(/\p{Diacritic}/gu, '');

/****** helpers specific to typeahead  *****/

export const normalizer = <T extends Dictionary>(listItems: string[] | Dictionary[] | T[], key?: string): T[] => {
  if (!listItems.length) return [];

  // validate array of objects
  if (isObject(listItems[0])) {
    // verify if key exists (i.e. normalized already)
    for (const item of listItems) {
      if (!getNestedValue(item, key as string)) {
        throw new Error('e03');
      }
    }

    return listItems as T[];
  }

  // normalize array of strings
  return (listItems as string[]).map((item) => ({
    [key as string]: isString(item) ? item : JSON.stringify(item),
  })) as T[];
};

/****** helpers specific to Trie  *****/

export const spaceTokenizer = (tokenString: string): string[] => tokenString.split(/\s+/);
