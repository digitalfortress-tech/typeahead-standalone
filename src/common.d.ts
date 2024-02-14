import type { TrieType } from './trie/types.d.ts';

export type Dictionary<T = unknown> = Record<string, T>;

export interface typeaheadDataSource<T> {
  /**
   * A callback that gets called immediately after the prefetch/remote endpoint returns a response. Useful to modify the response before it gets processed by typeahead.
   * @param data The input data to be transformed
   * @returns The transformed data
   */
  transform?: (data: string[] | Dictionary[]) => string[] | Dictionary[];
  /** An identifier is required when the data source format is an array of objects. An identifier is used to identify which property of the object should be used as the text for displaying the suggestions. Defaults to "label" */
  identifier?: 'label' | string;
  /**
   * A callback to ensure that all available suggestions are unique. Defaults to using the "display" callback defined in typehead's config.
   * @param selectedItem The selected suggestion
   * @returns A string that is unique to be able to distinguish between available suggestions
   */
  identity?: (selectedItem: T) => string;
  /** dataTokens is used to add additional properties of the source data to the search index */
  dataTokens?: string[];
  /** groupIdentifier is used to group suggestions by a given property in an array of source data */
  groupIdentifier?: string;
}

export interface LocalDataSource<T> extends typeaheadDataSource<T> {
  /**
   * An array of suggestions. Can be a list (array) of strings or a list (array) of objects.
   * @example
   *
   * // An array of strings
   * local: ["Blue", "Black", "Blonde"]
   *
   * // OR an array of objects
   * local: [{color: "Blue"}, {color: "Black"}, {color: "Blonde"}]
   *
   * // *Note: While using an array of objects, you must also set the identifier property.
   * // In this case the identifier will be the property "color".
   */
  local: string[] | T[];
}

export interface PrefetchDataSource<T> extends typeaheadDataSource<T> {
  /**
   * The Prefetch Data source is used to fetch data in advance
   */
  prefetch: {
    /**
     * The URL to call. Can be a string or a function that returns a string
     * @example
     *
     * // as a string
     * url: "https://mydomain/preload-suggestions"
     *
     * // as a callback
     * url: () => {
     *  const url = "...";  // generate url
     *  return url;
     * }
     */
    url: string | (() => string);
    /** A flag to indicate if the prefetch request was completed or not. Defaults to false */
    done?: boolean;
    /** To indicate when the prefetch request should occur. Defaults to "onInit" i.e. suggestions will be prefetched as soon as typeahead is initialised  */
    when?: 'onInit' | 'onFocus';
    /**
     * Callback to process data returned by the remote endpoint. (The data gets first gets transformed by the "transform" callback before being processed by this callback.)
     * @param items The transformed items (i.e. the list of suggestions)
     */
    process?: (items: T[]) => void;
    /**
     * The Fetch API is used to query remote endpoints. You may provide an object of requestOptions to customize the outgoing request. By default the query type is GET
     * @example
     *
     * // To use a "POST" request instead of the default "GET",
     * requestOptions: {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ hello: 'world' }),
     * },
     **/
    requestOptions?: Dictionary;
  };
}

export interface RemoteDataSource<T> extends typeaheadDataSource<T> {
  remote: {
    /**
     * The URL to call. Can be a string or a function that returns a string
     * * @example
     *
     * // as a string
     * url: "https://mydomain/preload-suggestions"
     *
     * // as a callback
     * url: (query) => {
     *  const url = `https://mydomain/searchquery=${encodeURIComponent(query)}`;  // generate url
     *  return url;
     * }
     * */
    url: string | ((query: string) => string);
    /** A string that gets replaced by the query string. Used only if the URL is a string */
    wildcard?: string;
    /**
     * The Fetch API is used to query remote endpoints. You may provide an object of requestOptions to customize the outgoing request. By default the query type is GET
     * @example
     *
     * // To use a "POST" request instead of the default "GET",
     * requestOptions: {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ hello: 'world' }),
     * },
     **/
    requestOptions?: Dictionary;
  };
}

export interface typeaheadHtmlTemplates<T extends Dictionary> {
  /**
   * The header template is rendered at the top of the dataset.
   * @param resultSet An object containing data about the matched suggestions.
   * @returns A string that can contain HTML
   */
  header?: (resultSet: ResultSet<T>) => string;
  /**
   * The footer template is rendered at the bottom of the dataset.
   * @param resultSet An object containing data about the matched suggestions.
   * @returns A string that can contain HTML
   */
  footer?: (resultSet: ResultSet<T>) => string;
  /**
   * The suggestion template is used to render a single suggestion.
   * @param item The current suggestion
   * @param resultSet An object containing data about the matched suggestions.
   * @returns  A string that can contain HTML
   *
   * @example
   *
   * // When suggestions is a list of strings
   * suggestion: (item) =>
   *  `<div class="info">${item} (${Date.now()})</div>`
   *
   * // When suggestions is a list of objects
   *  suggestion: (item) =>
   *  `<div class="info">${item.id} - ${item.color}</div>`
   */
  suggestion?: (item: T, resultSet: ResultSet<T>) => string;
  /** A callback that returns a string/HTML used to render a group heading. */
  /**
   * The group template is used to render a group heading.
   * @param groupName The name of the group
   * @param resultSet An object containing data about the matched suggestions.
   * @returns A string that can contain HTML
   */
  group?: (groupName: string, resultSet: ResultSet<T>) => string;
  /**
   * The empty template is rendered when the input query is empty.
   * This template can be used to display some suggestions by default or to display some html content
   * @param resultSet An object containing data about the matched suggestions.
   * @returns A string that can contain HTML or nothing/void
   *
   * @example
   *
   * // To display some default suggestions
   * empty: (resultSet) => {
   *  resultSet.defaultItems = ["Silver", "Gold"];
   * }
   *
   * // To display some html content
   * empty: () =>
   *  `<h3>Trying searching for colors like Grey...</h3>`;
   *
   */
  empty?: (resultSet: ResultSet<T>) => string | void;
  /**
   * The notFound template is rendered when no matching suggestion is found.
   * @param resultSet An object containing data about the matched suggestions.
   * @returns A string that can contain HTML
   *
   * @example
   *
   *  notFound: () =>
   *  `<span class="warning">Oops... Nothing Found</span>`;
   */
  notFound?: (resultSet: ResultSet<T>) => string;
  /** A callback that returns a string/HTML used to render a loading state (while awaiting data from a remote endpoint). */
  /**
   * The loader template is used to render a loading state (for example: while awaiting data from a remote endpoint).
   * @param resultSet An object containing data about the matched suggestions.
   * @returns A string that can contain HTML
   */
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
  /**
   * A className to be added to the container.
   * @deprecated since v.4.x.x. Will be removed in v5
   */
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
  /**
   * This callback is executed when the user selects an item from the suggestions. The current suggestion/item is passed as a parameter and it must return a string which is set as the input's value.
   * It is an optional property. When the suggestions are a list of strings, it uses the matched string as the default value whereas when the sugeestions are a list of objects, it uses the text value of the "identifier" property as a default value.
   * @param selectedItem The current/selected item
   * @param ev A Mouse/Keyboard event which can be used to track user interaction or for analytics. Defaults to null
   * @returns The string to be displayed in the input element.
   */
  display?: (selectedItem: T, ev?: MouseEvent | KeyboardEvent | null) => string;
  /**
   * When you want to use typeahead outside a form element, this handler can be used to process/submit the input value. Gets triggered on hitting the ENTER key.
   * @param e Keyboard Event
   * @param selectedItem  The selected item/suggestion or undefined if no item was selected
   */
  onSubmit?: (e: Event, selectedItem?: T) => void;
  /** Delays execution of making Ajax requests (in milliseconds). Default: 100 ms */
  debounceRemote?: number;
  /** If your input element is used inside a form element, this flag allows to prevent the default submit action when the ENTER key is pressed. Defaults to false */
  preventSubmit?: boolean; // Prevents automatic form submit when ENTER is pressed
  /** The source of suggestions. You are required to use at least 1 source - local, remote or prefetch. You are free to use multiple/all sources together */
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
  /**
   *  A callback that allows adding suggestions to the search index. Similar to adding items via the Local source.
   * @param suggestions The list of suggestions to be added to the search index
   */
  addToIndex: (suggestions: string[] | Dictionary[] | T[]) => void;
  /**
   * Resets the typeahead instance to the state it was in before any user interaction. It removes all items from the search index except those that were added via a local source. Reset() also clears cached remote requests.
   * @param clearLocalSrc Set to true to remove absolutely all items. Defaults to false which means that Suggestions added via local source are not removed by default.
   * @returns
   */
  reset: (clearLocalSrc?: boolean) => void;
  /** Destroys the typeahead instance, clears search index, removes all event handlers and cleans up the DOM. Can be used if you wish to deactivate typeahead. */
  destroy: () => void;
  /** The internal Trie instance. Available only in "dev" mode */
  trie?: TrieType<T>;
}

// Declare the module
declare module 'typeahead-standalone';
// generated via plugin-dts
declare function typeahead<T extends Dictionary>(config: typeaheadConfig<T>): typeaheadResult<T>;
export default typeahead;
