import { Dictionary } from '../types';

export interface TrieAPI<T extends Dictionary> {
  add(data: string | string[] | Dictionary[], identifier?: string, identity?: (param: T) => void): void;
  search(prefix: string, limit?: number): string[] | Dictionary[];
  clear(): void;
}

export type TrieType<T extends Dictionary> = () => TrieAPI<T>;
