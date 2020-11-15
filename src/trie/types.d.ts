export interface TrieType {
  add(prefix: string, data?: Record<string, unknown>): void;
  addAll(iterable: string[]): TrieType;
  find(prefix: string, limit?: number): string[] | Record<string, unknown>[];
  clear(): void;
}
