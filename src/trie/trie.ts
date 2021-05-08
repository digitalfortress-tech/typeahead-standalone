import { Dictionary } from '../types';
import type { TrieType } from './types';
import { spaceTokenizer } from '../helpers';

// Trie algorithm (inspired by data structures @https://github.com/Yomguithereal/mnemonist)
export const Trie = function (): TrieType {
  let root: Record<string, unknown> = {};

  // constant to mark the end of a string
  const SENTINEL = String.fromCharCode(0);

  /**
   * Method used to add the given prefix to the trie.
   * You can optionally provide data, which will be stored in the tree as well
   */
  function add(prefix: string, data?: unknown) {
    let node = root;
    let token;
    data = data ? data : prefix;
    prefix = prefix.toLocaleLowerCase(); // to make the search case insensitive

    for (let i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i];
      node = (node[token] || (node[token] = {})) as Record<string, unknown>;
    }

    // we store data within an array to avoid collisions
    node[SENTINEL] = node[SENTINEL] ? [...(node[SENTINEL] as Dictionary[]), data] : [data];
  }

  /**
   * Method used to retrieve every item in the trie beginning with the given prefix.
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
        // limit found matches
        if (limit && matches.length >= limit) break;

        if (k === SENTINEL) {
          matches = (matches as Dictionary[]).concat(node[SENTINEL] as Dictionary[]);

          // specific to typeahead
          if (identifier) {
            // deduplicate matches
            matches = [...new Map((matches as Dictionary[]).map((item) => [item[identifier], item])).values()];
          }
          continue;
        }

        nodeStack.push(node[k] as Record<string, unknown>);
        prefixStack.push(prefix + k);
      }
    }

    // if concatenation of matches leads to addition of extra items, truncate the matches[] array
    if (limit && matches.length > limit) {
      matches.length = 5;
    }

    return matches;
  }

  /**
   * Adds the given array of strings/objects to the trie
   */
  function addAll(iterable: string[] | Dictionary[], identifier = 'label') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const trie = this as TrieType;
    iterable.forEach((value: string | Dictionary) => {
      const dataTokens =
        typeof value === 'string' ? spaceTokenizer(value) : spaceTokenizer(value[identifier] as string);
      dataTokens.forEach((token) => trie.add(token, value));
    });
  }

  function search(query: string, identifier?: string, limit?: number) {
    const searchTokens = spaceTokenizer(query);
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
      suggestions.length = 5;
    }

    return suggestions;
  }

  function clear() {
    root = {};
  }

  return {
    add,
    addAll,
    find,
    clear,
    search,
  };
};
