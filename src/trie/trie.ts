import { Dictionary } from '../types';
import type { TrieType } from './types';
import { deduplicateArr, spaceTokenizer } from '../helpers';

// Trie algorithm (inspired by data structures @https://github.com/Yomguithereal/mnemonist)
export const Trie = function (): TrieType {
  let root: Record<string, unknown> = {};

  // constant to mark the end of a string
  const SENTINEL = String.fromCharCode(0);

  /**
   * Method used to add the given data to the trie.
   * Identifier is optional when data is a string|string[], but mandatory for Dictionary[]
   */
  function add(data: string | string[] | Dictionary[], identifier = '') {
    if (!data) return;

    let node = root;
    let token;
    data = (data.constructor === Array ? data : [data]) as [];

    data.forEach((value: string | Dictionary) => {
      // we tokenize the incoming data to make search possible by fragments
      const dataTokens =
        typeof value === 'string' ? spaceTokenizer(value) : spaceTokenizer((value[identifier] as string) || '');
      dataTokens
        .filter((item) => item) // filter out falsy values
        .forEach((prefix) => {
          node = root;
          prefix = prefix.toLocaleLowerCase(); // make search case insensitive

          for (let i = 0, l = prefix.length; i < l; i++) {
            token = prefix[i];
            node = (node[token] || (node[token] = {})) as Record<string, unknown>;
          }

          // we store data within an array to avoid collisions
          node[SENTINEL] = node[SENTINEL] ? [...(node[SENTINEL] as Dictionary[]), value] : [value];
        });
    });
  }

  /**
   * Internal Method used to retrieve items in the trie beginning with the given prefix.
   */
  function find(prefix: string, identifier?: string, limit?: number): string[] | Dictionary[] {
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

          // deduplicate matches, specific to typeahead
          if (identifier) {
            matches = deduplicateArr(matches, identifier);
          }
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

    return matches;
  }

  /**
   * Search for query strings within the trie
   */
  function search(query: string, identifier?: string, limit?: number) {
    const searchTokens = spaceTokenizer(query);

    // search for single token/query
    if (searchTokens.length === 1) {
      return find(searchTokens[0], identifier, limit);
    }

    // Search for multiple tokens/queries
    const objArrs: Dictionary[][] = [];
    let suggestions: string[] | Dictionary[] = [];
    searchTokens.forEach((token) => {
      // note that limit is not passed to "find()"
      objArrs.push(find(token, identifier) as Dictionary[]);
    });

    // get intersection of found suggestions
    suggestions = objArrs.reduce((acc: Dictionary[], currentArr: Dictionary[]) => {
      return acc.filter((accItem: Dictionary) => {
        return currentArr.some((currentArrItem: Dictionary) => {
          return accItem[identifier as string] === currentArrItem[identifier as string];
        });
      });
    });

    // truncate suggestions to limit
    if (limit && suggestions.length > limit) {
      suggestions.length = limit;
    }

    return suggestions;
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
