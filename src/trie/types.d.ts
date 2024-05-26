import type { Dictionary } from '../common.d.ts';

export interface SearchResults<T> {
  suggestions: T[];
  count: number;
}

export interface TrieAPI<T extends Dictionary> {
  add(data: string | string[] | Dictionary[], key?: string, identity?: (param: T) => void): void;
  search(prefix: string, limit?: number): SearchResults<T>;
  clear(): void;
}

export interface TrieConfig {
  hasDiacritics?: boolean;
  tokenizer?: (query: string) => string[];
}

export type TrieType<T extends Dictionary> = (config?: TrieConfig) => TrieAPI<T>;
