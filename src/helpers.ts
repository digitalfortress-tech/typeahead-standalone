import type { Dictionary } from './common.d.ts';

export const NOOP = (...args: unknown[]): void => undefined;

export const escapeRegExp = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const isObject = (item: unknown): item is Dictionary => {
  return item !== null && (item as Dictionary)?.constructor.name === 'Object';
};

export const isString = (item: unknown): item is string => typeof item === 'string';

export const getNestedValue = (obj: unknown, selector: string): string => {
  let ref: any = obj;
  const keys = selector.split('.');

  for (const key of keys) {
    if (!isObject(ref) || !(key in ref)) {
      return '';
    }
    ref = ref[key];
  }

  return `${ref}`;
};

/** @deprecated */
export const deduplicateArr = (iterable: Dictionary[], prop: string): Dictionary[] => [
  ...new Map(iterable.map((item) => [item[prop], item])).values(),
];

export const diacritics = (txt = '') => txt.normalize('NFD').replace(/\p{Diacritic}/gu, '');

/****** helpers specific to typeahead  *****/

export const normalizer = <T extends Dictionary>(listItems: string[] | Dictionary[] | T[], key: string): T[] => {
  if (!listItems.length) return [];

  // validate array of objects
  if (isObject(listItems[0])) {
    // verify if key exists (i.e. normalized already)
    for (const item of listItems) {
      if (!getNestedValue(item, key)) {
        throw new Error('e03');
      }
    }

    return listItems as T[];
  }

  // normalize array of strings
  return (listItems as string[]).map((item) => ({
    [key]: isString(item) ? item : JSON.stringify(item),
  })) as T[];
};

/****** helpers specific to Trie  *****/

export const spaceTokenizer = (tokenString: string): string[] => tokenString.split(/\s+/);
