import type { Dictionary } from './types';

export const NOOP = (...args: unknown[]): void => undefined;

export const escapeRegExp = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const isObject = (item: any): boolean => {
  return item !== null && item.constructor.name === 'Object';
};

/****** helpers specific to typeahead  *****/

export const onSelectCb = <T extends Dictionary>(item: T, identifier: string, input: HTMLInputElement): void => {
  input.value = (item[identifier] as string) || '';
};

export const normalizer = <T extends Dictionary>(listItems: string[] | Dictionary[] | T[], identifier: string): T[] => {
  if (!listItems.length) return [];

  const testItem = listItems[0] as Dictionary;

  if (isObject(testItem)) {
    // return if identifier exists (i.e. normalized already)
    if (identifier in testItem) {
      return listItems as T[];
    } else {
      throw new Error('Missing identifier');
    }
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
