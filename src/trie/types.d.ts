import { Dictionary } from '../types';

export interface TrieType {
  add(data: string | string[] | Dictionary[], identifier?: string): void;
  search(prefix: string, identifier?: string, limit?: number): string[] | Dictionary[];
  clear(): void;
}
