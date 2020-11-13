export interface TrieType {
  add(prefix: string | string[]): void;
  addAll(iterable: string[]): TrieType;
  find(prefix: string | string[]): string[];
  clear(): void;
}
