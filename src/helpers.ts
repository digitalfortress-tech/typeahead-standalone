import type { Dictionary } from './types';

export const NOOP = (...args: unknown[]): void => undefined;

export const escapeRegExp = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const isObject = (item: any): boolean => {
  return item !== null && item.constructor.name === 'Object';
};

/****** helpers specific to typeahead  *****/

export const normalizer = <T extends Dictionary>(listItems: string[] | Dictionary[] | T[], identifier: string): T[] => {
  const length = listItems.length;
  if (!length) return [];

  if (isObject(listItems[0] as Dictionary)) {
    // verify if identifier exists (i.e. normalized already)
    for (let x = 0; x < length; x++) {
      if (!(identifier in (listItems[x] as Dictionary))) {
        throw new Error('Missing identifier');
      }
    }
    return listItems as T[];
  }

  // The default identifier (label) is used for string arrays
  const normalizedData = (listItems as []).reduce(function (acc: Record<string, unknown>[], currentItem) {
    acc.push({
      [identifier]: currentItem && typeof currentItem === 'string' ? currentItem : JSON.stringify(currentItem),
    });
    return acc;
  }, []);

  return normalizedData as T[];
};

export const spaceTokenizer = (tokenString: string): string[] => tokenString.trim().split(/\s+/);
