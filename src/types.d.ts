import type { TrieType } from './trie/types.d.ts';

export type Dictionary<T = unknown> = Record<string, T>;

export interface typeaheadDataSource<T> {
  /** A callback that gets called immediately after the prefetch/remote endpoint returns a response. Useful to modify the response before it gets processed by typeahead. */
  transform?: (data: string[] | Dictionary[]) => string[] | Dictionary[];
  /** An identifier is required when the data source format is an array of objects. An identifier is used to identify which property of the object should be used as the text for displaying the suggestions. Defaults to "label" */
  identifier?: 'label' | string;
  /** This callback receives the selectedItem as a parameter and it must return a unique string that makes this suggestion unique from the other suggestions */
  identity?: (selectedItem: T) => string;
  /** dataTokens is used to add additional properties of the source data to the search index */
  dataTokens?: string[];
  /** groupIdentifier is used to group suggestions by a given property in an array of source data */
  groupIdentifier?: string;
}

export interface LocalDataSource<T> extends typeaheadDataSource<T> {
  /** An array of suggestions. Can be an array of strings or an array of objects. */
  local: string[] | T[];
}

export interface PrefetchDataSource<T> extends typeaheadDataSource<T> {
  prefetch: {
    /** The URL to call. Can be a string or a function that returns a string */
    url: string | (() => string);
    /** A flag to indicate if the prefetch request was completed or not */
    done: boolean;
    /** To indicate when the prefetch request should occur. Defaults to "onInit" i.e. suggestions will be prefetched as soon as typeahead is initialised  */
    when?: 'onInit' | 'onFocus';
    /** Callback to process data returned by the remote endpoint. (The data gets first gets transformed by the "transform" callback and then goes through this callback. ) */
    process?: (items: T[]) => void;
    /** The Fetch API is used to query remote endpoints. You may provide an object of requestOptions to customize the outgoing request. By default the query type is GET */
    requestOptions?: Dictionary;
  };
}

export interface RemoteDataSource<T> extends typeaheadDataSource<T> {
  remote: {
    /** The URL to call. Can be a string or a function that returns a string */
    url: string | ((query: string) => string);
    /** A string that gets replaced by the query string. Used only if the URL is a string */
    wildcard?: string;
    /** The Fetch API is used to query remote endpoints. You may provide an object of requestOptions to customize the outgoing request. By default the query type is GET */
    requestOptions?: Dictionary;
  };
}

export interface typeaheadHtmlTemplates<T extends Dictionary> {
  /** A callback that returns a string/HTML that is rendered at the top of the dataset. */
  header?: (resultSet: ResultSet<T>) => string;
  /** A callback that returns a string/HTML that is rendered at the bottom of the dataset */
  footer?: (resultSet: ResultSet<T>) => string;
  /** A callback that returns a string/HTML used to render a single suggestion. */
  suggestion?: (item: T, resultSet: ResultSet<T>) => string;
  /** A callback that returns a string/HTML used to render a group heading. */
  group?: (groupName: string, resultSet: ResultSet<T>) => string;
  /** A callback that returns a string/HTML rendered when the input query is empty. Can be used to display some suggestions by default by using the resultSet. */
  empty?: (resultSet: ResultSet<T>) => string;
  /** A callback that returns a string/HTML used to render when no matching suggestion exists. */
  notFound?: (resultSet: ResultSet<T>) => string;
  /** A callback that returns a string/HTML used to render a loading state (while awaiting data from a remote endpoint). */
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
  /** The input HTML element */
  input: HTMLInputElement;
  className?: string;
  /** The Classnames to be to each type of element/item used */
  classNames?: typeaheadStyleClasses;
  /** The minimum number of characters needed to trigger displaying suggestions. Defaults to 1 */
  minLength?: number;
  /** The maximum number of suggestions to show. Defaults to 5. */
  limit?: number;
  /** Control if the hint should be shown or not. Defaults to true */
  hint?: boolean;
  /** If set to true, pre-selects the first displayed suggestion. Defaults to false */
  autoSelect?: boolean;
  /** Highlights in the matched characters in the list of suggestions. Defaults to false */
  highlight?: boolean;
  /** Activate language diacritics i.e. search by converting accented characters into their non-accented counterpart. Defaults to false */
  diacritics?: boolean;
  /** This callback is executed when the user selects an item from the suggestions. The current suggestion/item is passed as a parameter and it must return a string which is set as the input's value. The 2nd optional parameter event is a Mouse/Keyboard event which can be used to track user interaction or for analytics. It defaults to null */
  display?: (selectedItem: T, ev?: MouseEvent | KeyboardEvent | null) => string;
  /** When you want to use typeahead outside a form element, this handler can be used to process/submit the input value. Gets triggered on hitting the ENTER key. First parameter is the keyboard Event and the 2nd parameter is the selected item or undefined if no item was selected */
  onSubmit?: (e: Event, selectedItem?: T) => void;
  /** Delays execution of making Ajax requests (in milliseconds). Default: 100 ms */
  debounceRemote?: number;
  /** If your input element is used inside a form element, this flag allows to prevent the default submit action when the ENTER key is pressed. Defaults to false */
  preventSubmit?: boolean; // Prevents automatic form submit when ENTER is pressed
  /** The source of suggestions. You are required to use at least 1 source - local, remote or prefetch */
  source: LocalDataSource<T> | PrefetchDataSource<T> | RemoteDataSource<T>;
  /** Templates that allow you to customise styling */
  templates?: typeaheadHtmlTemplates<T>;
}

export interface ResultSet<T extends Dictionary> {
  /** The input search query */
  query: string;
  /** The found suggestions */
  items: T[];
  /** The total number of matching suggestions */
  count: number;
  /** The max number of suggestions to be displayed */
  limit: number;
  /** The default suggestions to be shown when the input search query is empty */
  defaultItems?: T[];
  /** A reference to the HTML Root that displays suggestions */
  container?: HTMLSpanElement;
  [key: string]: unknown;
}

export interface typeaheadResult<T extends Dictionary> {
  /** A callback that allows adding suggestions to the search index. Similar to adding items via the Local source. */
  addToIndex: (suggestions: string[] | Dictionary[] | T[]) => void;
  /** Resets the typeahead instance to the state it was in before any user interaction. It removes all items from the search index except those that were added via a local source. To remove absolutely all items, the function accepts an optional parameter which should be set to true. Reset() also clears cached remote requests. */
  reset: (clearLocalSrc?: boolean) => void;
  /** Destroys the typeahead instance, clears search index, removes all event handlers and cleans up the DOM. Can be used if you wish to deactivate typeahead. */
  destroy: () => void;
  trie?: TrieType<T>;
}

// Declare the module
declare module 'typeahead-standalone';
// generated via plugin-dts
declare function typeahead<T extends Dictionary>(config: typeaheadConfig<T>): typeaheadResult<T>;
export default typeahead;
