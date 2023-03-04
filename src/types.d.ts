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
  header?: (resultSet: ResultSet<T>) => string;
  footer?: (resultSet: ResultSet<T>) => string;
  suggestion?: (item: T, resultSet: ResultSet<T>) => string;
  group?: (groupName: string, resultSet: ResultSet<T>) => string;
  empty?: (resultSet: ResultSet<T>) => string;
  notFound?: (resultSet: ResultSet<T>) => string;
  loader?: () => string;
}

export interface typeaheadStyleClasses {
  input: string;
  hint: string;
  highlight: string;
  hide: string;
  show: string;
  list: string;
  selected: string;
  header: string;
  footer: string;
  loader: string;
  suggestion: string;
  group: string;
  empty: string;
  notFound: string;
  wrapper: string;
}

export interface typeaheadConfig<T extends Dictionary> {
  input: HTMLInputElement;
  className?: string;
  classNames?: typeaheadStyleClasses;
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
  source: LocalDataSource<T> | PrefetchDataSource<T> | RemoteDataSource<T>;
  templates?: typeaheadHtmlTemplates<T>;
}

export interface ResultSet<T extends Dictionary> {
  query: string;
  items: T[];
  count: number;
  limit: number;
  defaultItems?: T[];
  container?: HTMLSpanElement;
  [key: string]: unknown;
}

export interface typeaheadResult<T extends Dictionary> {
  destroy: () => void;
  trie?: TrieType<T>;
}
