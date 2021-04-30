import type { TrieType } from './types';

// Trie algorithm (inspired by data structures @https://github.com/Yomguithereal/mnemonist)
export const Trie = function (): TrieType {
  let root: Record<string, unknown>, size: number;
  clear();

  // constant to mark the end of a string
  const SENTINEL = String.fromCharCode(0);

  /**
   * Method used to add the given prefix to the trie.
   * You can optionally provide data, which will be stored in the tree as well
   */
  function add(prefix: string, data?: Record<string, unknown>) {
    let node = root;
    let token;
    prefix = prefix.toLowerCase(); // to make the search case insensitive

    for (let i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i];
      node = (node[token] || (node[token] = {})) as Record<string, unknown>;
    }

    // Do we need to increase size?
    if (!(SENTINEL in node)) size++;

    node[SENTINEL] = data || true;
  }

  /**
   * Method used to retrieve every item in the trie beginning with the given prefix.
   */
  function find(prefix: string, limit?: number): string[] | Record<string, unknown>[] {
    let node = root;
    const matches: string[] | Record<string, unknown>[] = [];
    let token, i, l;

    for (i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i];
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
          node[SENTINEL] === true ? matches.push(prefix as any) : matches.push(node[SENTINEL] as any);
          continue;
        }

        nodeStack.push(node[k] as Record<string, unknown>);
        prefixStack.push(prefix + k);
      }
    }

    return matches;
  }

  /**
   * Adds the given array of strings/objects to the trie
   */
  function addAll(iterable: string[] | Record<string, unknown>[], identifier = 'label'): TrieType {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const trie = this as TrieType;
    iterable.forEach((value: string | Record<string, unknown>) => {
      if (typeof value === 'string') {
        trie.add(value);
      } else {
        trie.add(value[identifier] as string, value);
      }
    });

    return trie;
  }

  function clear() {
    root = {};
    size = 0;
  }

  return {
    add,
    addAll,
    find,
    clear,
  };
};

/**
 * Create a new trie from items
 * @deprecated 13 Nov 2020
 * */
// export function TrieInit(iterable: unknown[]): TrieType {
//   const tr = new (Trie as any)();
//   iterable.forEach((value: unknown) => {
//     tr.add(value);
//   });
//   return tr;
// }
