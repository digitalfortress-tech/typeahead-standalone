import type { Dictionary } from '../common.d.ts';
import type { SearchResults, TrieType } from './types.d.ts';
import { spaceTokenizer, diacritics } from '../helpers.js';

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

    let node: Record<string, unknown>;
    data = Array.isArray(data) ? data : [data];
    const isStringArr = typeof data[0] === 'string';

    for (const value of data) {
      // we tokenize the incoming data to make search possible by fragments and also filter out falsy values
      const dataTokens = tokenize(
        isStringArr ? (value as string) : ((value as Dictionary)[identifier] as string)
      ).filter(Boolean);
      for (const prefix of dataTokens) {
        node = root;

        for (const char of prefix) {
          node = (node[char] ||= {}) as Record<string, unknown>;
        }

        const uniqueId = isStringArr ? value : (identity && identity(value)) || JSON.stringify(value);
        const sentinelNode = (node[SENTINEL] ??= {});
        (sentinelNode as Dictionary)[uniqueId as string] = value;
      }
    }
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
