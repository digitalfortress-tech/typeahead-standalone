import type { Dictionary } from '../common.d.ts';

export interface SearchResults<T> {
  suggestions: T[];
  count: number;
}

export interface TrieAPI<T extends Dictionary> {
  /**
   * Adds data to the trie
   * @param data This is the data to be added to the trie/search index. It can be a string or an array of strings/objects
   * @param key If the input is an array of objects, this parameter identifies key should be used to access the data to the added to the search index
   * @param identity If the input is an array of objects and the provided key is not unique, this callback can be used to return a string that is unique. It receives the entire object as the parameter
   * @example
   *
   * const trie = new Trie();
   *
   * // to add a string
   * trie.add('Yellow');
   *
   * // to add an array of strings
   * trie.add(['Green', 'Grey']);
   *
   * // to add an array of objects
   * trie.add([{ title: 'Yeshua'}, {title: 'Yahweh'}], 'title');
   */
  add(data: string | string[] | Dictionary[], key?: string, identity?: (param: T) => string): void;
  /**
   * Performs a DFS within the search index and retrives matches
   * @param query the search query
   * @param limit [Optional] the number of suggestions to return. If left undefined, it returns all matched suggestions
   * @returns {Object} An object containing the found results and the count of total found results.
   * @example
   *
   * const trie = new Trie();
   *
   * // returns suggestions beginning with "gr" and limits the returned results to 2.
   * trie.search('gr', 2); // { suggestions: ['grey', 'green'], count: 45}
   *
   * // returns all suggestions beginning with "go" AND "the"
   * trie.search('go the'); // { suggestions: ['God the great ', 'good old themes'], count: 2};
   */
  search(query: string, limit?: number): SearchResults<T>;
  /**
   * Clears the search index
   */
  clear(): void;
}

export interface TrieConfig {
  /**
   * A flag to indicate if the data could contain characters other than english and normalise them if yes.
   */
  hasDiacritics?: boolean;
  /**
   * A function used to split the search query and the search data by a given character(s).
   * This function is useful when you wish to search hypenated-words or words with a certain prefix/suffix
   * @param words The input words to be split
   * @returns by default, An array of words split by space characters (new line, tab, spaces).
   * @example
   *
   * const trie = new Trie({
   *   tokenizer: (words) => {
   *     return words.split(/-/); // split all hypenated words
   *     // return words.split(/\s+/); // split by spaces (default implementation)
   *     // return words.split(/\s+|-/); // splits by space characters + hyphenated words
   *   }
   * })
   */
  tokenizer?: (words: string) => string[];
}

export type TrieType<T extends Dictionary> = (config?: TrieConfig) => TrieAPI<T>;
