import { TrieType } from './trie/types';

export type Dictionary<T = unknown> = Record<string, T>;

export interface typeaheadDataSource<T> {
  transform?: (data: string[] | Dictionary[]) => string[] | Dictionary[];
  identifier?: 'label' | string;
  identity?: (selectedItem: T) => string;
  dataTokens?: string[];
  groupIdentifier?: string;
}

export interface LocalDataSource<T> extends typeaheadDataSource<T> {
  local: string[] | T[];
}

export interface FunctionDataSource<T> extends typeaheadDataSource<T> {
  fnSource: () => string[] | T[];
}

export interface PrefetchDataSource<T> extends typeaheadDataSource<T> {
  prefetch: {
    url: string | (() => string);
    done: boolean;
    when?: 'onInit' | 'onFocus';
    process?: (items: T[]) => void;
    requestOptions?: Dictionary;
  };
}

export interface RemoteDataSource<T> extends typeaheadDataSource<T> {
  remote: {
    url: string | (() => string);
    wildcard: string;
    requestOptions?: Dictionary;
  };
}

export interface typeaheadHtmlTemplates<T extends Dictionary> {
  header?: () => string;
  footer?: () => string;
  suggestion?: (item: T) => string;
  group?: (groupName?: string) => string;
  notFound?: () => string;
  // pending?: string;
}

export interface typeaheadConfig<T extends Dictionary> {
  input: HTMLInputElement;
  className?: string;
  minLength?: number;
  limit?: number;
  hint?: boolean;
  autoSelect?: boolean;
  highlight?: boolean;
  diacritics?: boolean;
  display?: (selectedItem: T, ev?: MouseEvent | KeyboardEvent | null) => string;
  onSubmit?: (e: Event, selectedItem?: T) => void;
  debounceRemote?: number;
  preventSubmit?: boolean; // Prevents automatic form submit when ENTER is pressed
  source: LocalDataSource<T> | PrefetchDataSource<T> | RemoteDataSource<T> | FunctionDataSource<T>;
  templates?: typeaheadHtmlTemplates<T>;
}

export interface typeaheadResult<T extends Dictionary> {
  destroy: () => void;
  trie?: TrieType<T>;
}
