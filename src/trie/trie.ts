import type { TrieType } from './types';

// Trie algorithm (inspired by https://github.com/Yomguithereal/mnemonist/blob/master/trie.js)
export const trieCore = function (): TrieType {
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

  function clear() {
    root = {};
    size = 0;
  }

  return {
    add,
    find,
    clear,
  };
};

export function Trie(iterable: unknown[]): TrieType {
  const trie = new (trieCore as any)();

  iterable.forEach((value: unknown) => {
    trie.add(value);
  });

  return trie;
}

// test
// const words = ['roman', 'romanesque', 'romanesco', 'cat', 'category', 'romanei', 'dd romaneidfs'];
// const trie = Trie(words);
// const res = trie.find('romane');
// console.log('ressss :>> ', res);
