export interface TrieType {
  add(prefix: string, data?: unknown): void;
  addAll(iterable: string[]): void;
  find(prefix: string, identifier?: string, limit?: number): string[] | Record<string, unknown>[];
  search(prefix: string, identifier?: string, limit?: number): string[] | Record<string, unknown>[];
  clear(): void;
}
