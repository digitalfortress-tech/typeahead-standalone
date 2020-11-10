export interface TrieType {
  add(prefix: string | string[]): void;
  find(prefix: string | string[]): string[];
  clear(): void;
}
