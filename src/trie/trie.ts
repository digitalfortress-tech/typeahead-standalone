import type { Dictionary } from '../common.d.ts';
import type { SearchResults, TrieType } from './types.d.ts';
import { spaceTokenizer, diacritics } from '../helpers.js';

// Trie algorithm (inspired by data structures @https://github.com/Yomguithereal/mnemonist)
export const Trie: TrieType<any> = (config = {}) => {
  const { hasDiacritics, tokenizer } = config;
  let root: Record<string, unknown> = {};

  // marks the end of a string
  const SENTINEL = String.fromCharCode(0);

  /**
   * Returns data/query tokens
   */
  function tokenize(value = '') {
    value = `${value}`.trim(); // coerce to string and trim

    if (hasDiacritics) {
      value = diacritics(value);
    }
    // make search case insensitive
    return (tokenizer || spaceTokenizer)(value.toLowerCase());
  }

  /**
   * Method used to add the given data to the trie.
   * key is optional when data is a string|string[], but mandatory for Dictionary[]
   */
  function add(data: string | string[] | Dictionary[], key = '', identity?: (item?: unknown) => void) {
    if (!data) return;

    let node: Record<string, unknown>;
    data = Array.isArray(data) ? data : [data];
    const isStringArr = typeof data[0] === 'string';

    for (const value of data) {
      // we tokenize the incoming data to make search possible by fragments
      const dataTokens = tokenize(isStringArr ? (value as string) : ((value as Dictionary)[key] as string));
      for (const prefix of dataTokens) {
        if (!prefix) continue; // filter out falsy values

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

    // traverse the root until you reach the end of prefix
    for (const char of prefix) {
      node = node?.[char] as Record<string, unknown>;
      if (typeof node === 'undefined') return {};
    }

    // Performing DFS (Depth-First Search) from prefix to traverse the tree
    const stack = [{ node, prefix }];
    let current;

    while (stack.length) {
      current = stack.pop() as { node: Record<string, unknown>; prefix: string };
      const { node, prefix } = current;

      for (const k in node) {
        if (k === SENTINEL) {
          // Object.assign(matches, node[SENTINEL]);
          const results = node[SENTINEL] as Dictionary;
          for (const resultKey in results) {
            matches[resultKey] = results[resultKey];
          }
        } else {
          stack.push({ node: node[k] as Record<string, unknown>, prefix: prefix + k });
        }
      }
    }

    return matches as Dictionary;
  }

  // Returns the intersection of two dictionaries
  const intersectDictionaries = (dict1: Dictionary, dict2: Dictionary): Dictionary => {
    const result: Dictionary = {};
    for (const key in dict1) {
      if (key in dict2) {
        result[key] = dict1[key];
      }
    }

    return result;
  };

  /**
   * Search for query strings within the trie
   */
  function search(query: string, limit?: number): SearchResults<Dictionary | string> {
    const queryTokens = tokenize(query);

    // Search for multiple tokens/queries and get initial matches
    let suggestions: Dictionary | Dictionary[] = find(queryTokens[0]);

    for (let i = 1; i < queryTokens.length; i++) {
      suggestions = intersectDictionaries(suggestions, find(queryTokens[i])); // get intersection of found suggestions
      if (!Object.keys(suggestions).length) break; // exit if no matches are found
    }

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
