export interface TrieType {
  add(prefix: string, data?: Record<string, unknown>): void;
  addAll(iterable: string[]): TrieType;
  find(prefix: string): string[] | Record<string, unknown>[];
  clear(): void;
}
