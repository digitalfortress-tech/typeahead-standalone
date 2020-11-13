import type { TrieType } from './types';

// Trie algorithm (inspired by data structures @https://github.com/Yomguithereal/mnemonist)
export const Trie = function (): TrieType {
  let root: Record<string, unknown>, size: number;
  clear();

  // constant to mark the end of a string
  const SENTINEL = String.fromCharCode(0);

  /**
   * Method used to add the given prefix to the trie.
   */
  function add(prefix: string | string[]) {
    let node = root;
    let token;

    for (let i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i];
      node = (node[token] || (node[token] = {})) as Record<string, unknown>;
    }

    // Do we need to increase size?
    if (!(SENTINEL in node)) size++;

    node[SENTINEL] = true;
  }

  /**
   * Method used to retrieve every item in the trie with the given prefix.
   */
  function find(prefix: string | string[]): string[] {
    const isString = typeof prefix === 'string';

    let node = root;
    const matches: string[] = [];
    let token, i, l;

    for (i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i];
      node = node[token] as Record<string, unknown>;

      if (typeof node === 'undefined') return matches;
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
          matches.push(prefix);
          continue;
        }

        nodeStack.push(node[k] as Record<string, unknown>);
        prefixStack.push(isString ? prefix + k : prefix.concat(k));
      }
    }

    return matches;
  }

  function addAll(iterable: string[]): TrieType {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const trie = this as TrieType;
    iterable.forEach((value: string) => {
      trie.add(value);
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
