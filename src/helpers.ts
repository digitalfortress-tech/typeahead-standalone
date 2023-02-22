import type { Dictionary } from './types';

export const NOOP = (...args: unknown[]): void => undefined;

export const escapeRegExp = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const isObject = (item: unknown): boolean => {
  return item !== null && (item as Dictionary)?.constructor.name === 'Object';
};

/** @deprecated */
export const deduplicateArr = (iterable: Dictionary[], prop: string): Dictionary[] => [
  ...new Map(iterable.map((item) => [item[prop], item])).values(),
];

export const diacritics = (txt = '') => txt.normalize('NFD').replace(/\p{Diacritic}/gu, '');

/****** helpers specific to typeahead  *****/

export const normalizer = <T extends Dictionary>(listItems: string[] | Dictionary[] | T[], identifier: string): T[] => {
  const length = listItems.length;
  if (!length) return [];

  // validate array of objects
  if (isObject(listItems[0])) {
    // verify if identifier exists (i.e. normalized already)
    for (let x = 0; x < length; x++) {
      if (!(identifier in (listItems[x] as Dictionary))) {
        throw new Error('e03');
      }
    }
    return listItems as T[];
  }

  // normalize array of strings
  const normalizedData = (listItems as []).reduce(function (acc: Record<string, unknown>[], currentItem) {
    acc.push({
      [identifier]: currentItem && typeof currentItem === 'string' ? currentItem : JSON.stringify(currentItem),
    });
    return acc;
  }, []);

  return normalizedData as T[];
};

/****** helpers specific to Trie  *****/

export const spaceTokenizer = (tokenString: string): string[] => tokenString.trim().split(/\s+/);
