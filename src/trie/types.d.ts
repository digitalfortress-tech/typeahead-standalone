import type { Dictionary } from '../index.d.cts';

export interface SearchResults<T> {
  suggestions: T[];
  count: number;
}

export interface TrieAPI<T extends Dictionary> {
  add(data: string | string[] | Dictionary[], identifier?: string, identity?: (param: T) => void): void;
  search(prefix: string, limit?: number): SearchResults<T>;
  clear(): void;
}

export interface TrieConfig {
  hasDiacritics?: boolean;
}

export type TrieType<T extends Dictionary> = (config?: TrieConfig) => TrieAPI<T>;
