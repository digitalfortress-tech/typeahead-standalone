import type { Dictionary } from '../types.d.ts';
import type { SearchResults, TrieType } from './types.d.ts';
import { spaceTokenizer, diacritics } from '../helpers.ts';

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
    value = `${value}`; // coerce to string

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

          const uniqueId = typeof value === 'string' ? value : (identity && identity(value)) || JSON.stringify(value);

          if (!node[SENTINEL]) {
            node[SENTINEL] = {
              [uniqueId]: value,
            };
          } else {
            (node[SENTINEL] as Dictionary)[uniqueId] = value;
          }
        });
    });
  }

  /**
   * Internal Method used to retrieve items in the trie beginning with the given prefix.
   */
  function find(prefix: string): Dictionary {
    let node = root;
    let matches: Dictionary = {};
    let token;

    // traverse the root until you reach the end of prefix
    for (let i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i]; // each letter of search string
      node = node[token] as Record<string, unknown>;
      if (typeof node === 'undefined') return {};
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
          matches = Object.assign(matches, node[SENTINEL]);
          continue;
        }

        nodeStack.push(node[k] as Record<string, unknown>);
        prefixStack.push(prefix + k);
      }
    }

    return matches as Dictionary;
  }

  /**
   * Search for query strings within the trie
   */
  function search(query: string, limit?: number): SearchResults<Dictionary | string> {
    const queryTokens = tokenize(query);

    // Search for multiple tokens/queries
    const objArrs: Dictionary[] = [];
    let suggestions: Dictionary | Dictionary[] = {};
    queryTokens.forEach((token) => {
      // note that limit is not passed to "find()"
      objArrs.push(find(token) as Dictionary);
    });

    // get intersection of found suggestions
    suggestions = objArrs.reduce((acc: Dictionary, currentObj: Dictionary) => {
      const result: Dictionary = {};

      Object.keys(acc)
        .filter((key: string) => currentObj[key]) // keep suggestions with common keys
        .forEach((key) => {
          result[key] = acc[key];
        });

      return result;
    });

    suggestions = Object.values(suggestions) as Dictionary[];

    const count = suggestions.length;

    // truncate suggestions to limit
    if (limit && count > limit) {
      suggestions.length = limit;
    }

    return {
      suggestions,
      count,
    };
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
