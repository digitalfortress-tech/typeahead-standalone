import { Dictionary } from '../types';
import type { TrieType } from './types';
import { deduplicateArr, spaceTokenizer, diacritics } from '../helpers';

// Trie algorithm (inspired by data structures @https://github.com/Yomguithereal/mnemonist)
export const Trie: TrieType<any> = (config = {}) => {
  const { hasDiacritics } = config;
  let root: Record<string, unknown> = {};

  // marks the end of a string
  const SENTINEL = String.fromCharCode(0);

  /**
   * Returns data/query tokens
   */
  function tokenize(value = '') {
    if (hasDiacritics) {
      value = diacritics(value);
    }
    // make search case insensitive
    return spaceTokenizer(value.toLowerCase());
  }

  /**
   * Method used to add the given data to the trie.
   * Identifier is optional when data is a string|string[], but mandatory for Dictionary[]
   */
  function add(data: string | string[] | Dictionary[], identifier = '', identity?: (item?: unknown) => void) {
    if (!data) return;

    let node = root;
    let token;
    data = (data.constructor === Array ? data : [data]) as [];

    data.forEach((value: string | Dictionary) => {
      // we tokenize the incoming data to make search possible by fragments
      const dataTokens = tokenize(typeof value === 'string' ? value : (value[identifier] as string));
      dataTokens
        .filter((item) => item) // filter out falsy values
        .forEach((prefix) => {
          node = root;

          for (let i = 0, l = prefix.length; i < l; i++) {
            token = prefix[i];
            node = (node[token] || (node[token] = {})) as Record<string, unknown>;
          }

          const storable = {
            key: typeof value === 'string' ? value : (identity && identity(value)) || JSON.stringify(value), // key is expected to be unique
            value,
          };

          // store data within an array instead of an object to avoid being overwritten
          if (!node[SENTINEL]) {
            node[SENTINEL] = [storable];
          } else {
            node[SENTINEL] = deduplicateArr([...(node[SENTINEL] as Dictionary[]), storable], 'key');
          }
        });
    });
  }

  /**
   * Internal Method used to retrieve items in the trie beginning with the given prefix.
   */
  function find(prefix: string, limit?: number): string[] | Dictionary[] {
    let node = root;
    let matches: string[] | Dictionary[] = [];
    let token;

    // traverse the root until you reach the end of prefix
    for (let i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i]; // each letter of search string
      node = node[token] as Record<string, unknown>;
      if (typeof node === 'undefined') return matches as string[];
    }

    // Performing DFS (Depth-First Search) from prefix to traverse the tree
    const nodeStack = [node];
    const prefixStack = [prefix];
    let k;

    while (nodeStack.length) {
      prefix = prefixStack.pop() as string;
      node = nodeStack.pop() as Record<string, unknown>;

      for (k in node) {
        if (k === SENTINEL) {
          matches = (matches as Dictionary[]).concat(node[SENTINEL] as Dictionary[]);

          // limit found matches / truncate array
          if (limit && matches.length >= limit) {
            matches.length = limit;
            break;
          }

          continue;
        }

        nodeStack.push(node[k] as Record<string, unknown>);
        prefixStack.push(prefix + k);
      }
    }

    // deduplicate matches before returning them
    return deduplicateArr(matches as Dictionary[], 'key');
  }

  /**
   * Search for query strings within the trie
   */
  function search(query: string, limit?: number) {
    const queryTokens = tokenize(query);

    // Search for multiple tokens/queries
    const objArrs: Dictionary[][] = [];
    let suggestions: string[] | Dictionary[] = [];
    queryTokens.forEach((token) => {
      // note that limit is not passed to "find()"
      objArrs.push(find(token) as Dictionary[]);
    });

    // get intersection of found suggestions
    suggestions = objArrs.reduce((acc: Dictionary[], currentArr: Dictionary[]) =>
      acc.filter((accItem: Dictionary) =>
        currentArr.some((currentArrItem: Dictionary) => accItem['key'] === currentArrItem['key'])
      )
    );

    // truncate suggestions to limit
    if (limit && suggestions.length > limit) {
      suggestions.length = limit;
    }

    return suggestions.map((item) => item.value) as Dictionary[];
  }

  function clear() {
    root = {};
  }

  return {
    add,
    clear,
    search,
  };
};
