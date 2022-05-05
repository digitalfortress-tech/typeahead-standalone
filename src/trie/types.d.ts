import { Dictionary } from '../types';

export interface TrieType {
  add(data: string | string[] | Dictionary[], identifier?: string, identity?: (param: unknown) => undefined): void;
  search(prefix: string, limit?: number): string[] | Dictionary[];
  clear(): void;
}
