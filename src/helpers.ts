import type { typeaheadItem } from './types';

export const NOOP = (...args: unknown[]): void => undefined;

export const escapeRegExp = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

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
  const isObject = testItem && testItem.constructor.name === 'Object' ? true : false;

  if (!isString && !isObject) {
    throw new Error('Items provided must be a string array or an array of objects');
  }

  // check if already normalized
  if (isObject && testItem.label) {
    return listItems as T[];
  }

  const normalizedData = (listItems as []).reduce(function (acc: Record<string, unknown>[], currentItem) {
    acc.push(
      isObject && identifier
        ? { label: currentItem[identifier], ...(currentItem as Record<string, unknown>) }
        : { label: currentItem && typeof currentItem === 'string' ? currentItem : JSON.stringify(currentItem) }
    );
    return acc;
  }, []);

  return normalizedData as T[];
};
