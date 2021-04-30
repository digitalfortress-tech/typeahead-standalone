import type { typeaheadItem } from './types';

export const NOOP = (...args: unknown[]): void => undefined;

export const escapeRegExp = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const isObject = (item: any): boolean => {
  return item !== null && item.constructor.name === 'Object';
};

/****** helpers specific to typeahead  *****/

export const onSelectCb = <T extends typeaheadItem>(item: T, input: HTMLInputElement): void => {
  input.value = item.label || '';
};

export const normalizer = <T extends typeaheadItem>(
  listItems: string[] | Record<string, unknown>[] | T[],
  identifier = ''
): T[] => {
  if (!listItems.length) return [];
  const testItem = listItems[0] as typeaheadItem;

  // check array items
  const isString = testItem && typeof testItem === 'string' ? true : false;
  const isObj = isObject(testItem);

  if (!isString && !isObj) {
    throw new Error('Items provided must be a string array or an array of objects');
  }

  // check if already normalized
  if (isObj && testItem.label) {
    return listItems as T[];
  }

  const normalizedData = (listItems as []).reduce(function (acc: Record<string, unknown>[], currentItem) {
    acc.push(
      isObj && identifier
        ? { label: currentItem[identifier], ...(currentItem as Record<string, unknown>) }
        : { label: currentItem && typeof currentItem === 'string' ? currentItem : JSON.stringify(currentItem) }
    );
    return acc;
  }, []);

  return normalizedData as T[];
};
