/*
 * https://github.com/digitalfortress-tech/typeahead-standalone
 * Copyright (c) 2020 Niket Pathak
 * MIT License
 */

import type {
  typeaheadResult,
  typeaheadConfig,
  typeaheadHtmlTemplates,
  Dictionary,
  LocalDataSource,
  CustomDataSource,
  RemoteDataSource,
  PrefetchDataSource,
} from './types';
import { Keys } from './constants';
import { diacritics, escapeRegExp, isObject, NOOP, normalizer } from './helpers';
import { fetchWrapper } from './fetchWrapper/fetchWrapper';
import { Trie } from './trie/trie';
import './style.less';

export default function typeahead<T extends Dictionary>(config: typeaheadConfig<T>): typeaheadResult<T> {
  // check required params
  if (!config.input) throw new Error('e01');
  if (!config.source || !isObject(config.source)) throw new Error('e02');

  const doc = document;

  const listContainer: HTMLDivElement = doc.createElement('div');
  const listContainerStyle = listContainer.style;
  const debounceXHR = config.debounceRemote || 100;
  const preventSubmit = config.preventSubmit || false;
  const minLen = config.minLength || 1;
  const limitSuggestions = config.limit || 5;
  const hint = config.hint === false ? false : true;
  const autoSelect = config.autoSelect || false;
  const templates: typeaheadHtmlTemplates<T> | undefined = config.templates;
  const trie = Trie({ hasDiacritics: config.diacritics });
  const identifier = config.source.identifier || 'label'; // label is the default identifier
  const groupIdentifier = config.source.groupIdentifier || '';
  const displayCb = <T extends Dictionary>(item: T): string => {
    return `${item[identifier]}`;
  };
  const display: (item: T, e?: MouseEvent | KeyboardEvent | null) => string = config.display || displayCb;
  const identity = config.source.identity || displayCb;
  const onSubmit: (e: Event, item?: T) => void = config.onSubmit || NOOP;
  const dataTokens = config.source.dataTokens?.constructor === Array ? config.source.dataTokens : undefined;
  const remoteQueryCache: Dictionary = {};
  const remoteResponseCache: Dictionary = {};
  const showOnFocus = config.showOnFocus || false;
  const transform = config.source.transform || ((data) => data);
  const local = (config.source as LocalDataSource<T>).local || null;
  const customSource = (config.source as CustomDataSource<T>).customSource || null;
  const remote =
    (config.source as RemoteDataSource<T>).remote &&
    (config.source as RemoteDataSource<T>).remote.url &&
    (config.source as RemoteDataSource<T>).remote.wildcard
      ? (config.source as RemoteDataSource<T>).remote
      : null;
  const prefetch =
    (config.source as PrefetchDataSource<T>).prefetch && (config.source as PrefetchDataSource<T>).prefetch.url
      ? { ...{ when: 'onInit', done: false }, ...(config.source as PrefetchDataSource<T>).prefetch }
      : null;

  // validate presence of atleast one data-source
  if (!local && !prefetch && !remote && !customSource) throw new Error('e02');
  if (!!customSource && (!!local || !!prefetch || !!remote ) ) throw new Error('e02');

  let items: T[] = []; // suggestions
  let inputValue = '';
  let selected: T | undefined;
  let remoteDebounceTimer: number | undefined;
  let fetchInProgress = false;
  let storedInput = ''; // used only for keyboard navigation

  // init templates if they exist
  if (templates) {
    templates.header = typeof templates.header === 'function' ? templates.header : undefined;
    templates.footer = typeof templates.footer === 'function' ? templates.footer : undefined;
    templates.notFound = typeof templates.notFound === 'function' ? templates.notFound : undefined;
    templates.group = typeof templates.group === 'function' ? templates.group : undefined;
    templates.suggestion = typeof templates.suggestion === 'function' ? templates.suggestion : undefined;
  }

  if (local) {
    updateSearchIndex(normalizer(local, identifier) as T[]);
  }

  const input: HTMLInputElement = config.input;
  input.classList.add('tt-input');

  // Wrapper element
  const wrapper: HTMLSpanElement = doc.createElement('span');
  wrapper.className = `typeahead-standalone${config.className ? ` ${config.className}` : ''}`;

  // move input element into the wrapper element
  const parentEl = input.parentNode as HTMLElement;
  const inputIndex = [...parentEl.children].indexOf(input);
  parentEl.removeChild(input);
  wrapper.appendChild(input);

  // append Wrapper element to the original parent
  parentEl.insertBefore(wrapper, parentEl.children[inputIndex]);

  // generate markup for hints
  const inputHint: HTMLInputElement = input.cloneNode() as HTMLInputElement;
  hint && injectHintEl(inputHint);

  listContainer.classList.add('tt-list', 'tt-hide');
  listContainer.tabIndex = 0;
  listContainer.setAttribute('aria-label', 'menu-options');
  listContainer.setAttribute('role', 'listbox');

  // set listContainer positioning
  listContainerStyle.position = 'absolute'; // IOS implementation for fixed positioning has many bugs, so we will use absolute positioning
  listContainerStyle.width = '100%'; // fix position of listContainer
  listContainerStyle.left = '0';
  // listContainerStyle.top = `${input.clientHeight}px`; // or top: '100%' // not required apparently

  // Attach list container
  wrapper.appendChild(listContainer);

  if (prefetch && prefetch.when === 'onInit') {
    prefetchData();
  }

  function prefetchData() {
    // check if data was already prefetched for current session
    if (!prefetch || prefetch.done) return;

    let transformed: T[] = [];

    fetchWrapper
      .get(typeof prefetch.url === 'function' ? prefetch.url() : prefetch.url, prefetch?.requestOptions)
      .then(
        (data) => {
          transformed = transform(data) as T[];
          transformed = normalizer(transformed, identifier) as T[];
          updateSearchIndex(transformed);
        },
        (reject) => {
          console.error('e04', reject);
        }
      )
      .finally(() => {
        typeof prefetch.process === 'function' && prefetch.process(transformed);
      });

    prefetch.done = true;
  }

  /**
   * Display/show the listContainer
   */
  const show = (): void => {
    listContainer.classList.remove('tt-hide');
  };

  /**
   * Hides the listContainer from DOM
   */
  const hide = (): void => {
    listContainer.classList.add('tt-hide');
  };

  /**
   * Flag to indicate if the list of suggestions is open or not
   * @returns Boolean
   */
  const isListOpen = (): boolean => !listContainer.classList.contains('tt-hide');

  /**
   * Clear remote debounce timer if assigned
   */
  const clearRemoteDebounceTimer = (): void => {
    if (remoteDebounceTimer) {
      window.clearTimeout(remoteDebounceTimer);
    }
  };

  /**
   * Clear typeahead state and hide listContainer
   */
  const clear = (): void => {
    items = [];
    inputHint.value = '';
    storedInput = '';
    hide();
  };

  /**
   * Displays the NotFound template if it exists, otherwise, does nothing (i.e. returns true)
   * @param asyncRender set to true for asyncRenders
   * @returns true if no suggestions are found, else returns undefined
   */
  const noSuggestionsHandler = (asyncRender = false) => {
    if (!items.length) {
      // clear the list and the DOM
      clear();
      clearListDOM();

      if (!templates?.notFound) {
        return true;
      }

      const renderNotFoundTemplate = () => {
        const empty = doc.createElement('div');
        empty.classList.add('tt-notFound');
        templatify(empty, templates.notFound ? templates.notFound() : '');
        listContainer.appendChild(empty);
      };

      if (!remote) {
        renderNotFoundTemplate();
      } else if (
        (inputValue && asyncRender && !fetchInProgress) ||
        (inputValue && remoteQueryCache[JSON.stringify(inputValue)])
      ) {
        // wait for remote results before rendering notFoundTemplate / render immediately if request was cached
        renderNotFoundTemplate();
      }

      show();
      return true;
    }
  };

  /**
   * Delete all children from typeahead DOM listContainer
   */
  const clearListDOM = () => {
    while (listContainer.firstChild) {
      listContainer.firstChild.remove();
    }
  };

  /**
   * Responsible for drawing/updating the view
   */
  const update = (): void => {
    // No Matches
    if (noSuggestionsHandler()) return;

    clearListDOM();

    // function for rendering typeahead suggestions
    const render = (item: T): HTMLDivElement => {
      const itemElement = doc.createElement('div');
      itemElement.classList.add('tt-suggestion');
      itemElement.setAttribute('role', 'option');
      itemElement.setAttribute('aria-selected', 'false');
      itemElement.setAttribute('aria-label', display(item));
      if (templates?.suggestion) {
        templatify(itemElement, templates.suggestion(item));
      } else {
        itemElement.textContent = (item[identifier] as string) || '';
      }
      return itemElement;
    };

    // function to render typeahead groups
    const renderGroup = (groupName: string): HTMLDivElement => {
      const groupDiv = doc.createElement('div');
      groupDiv.classList.add('tt-group');
      groupDiv.setAttribute('role', 'group');
      groupDiv.setAttribute('aria-label', groupName);
      if (templates?.group) {
        templatify(groupDiv, templates.group(groupName));
      } else {
        groupDiv.textContent = groupName || '';
      }
      return groupDiv;
    };

    const fragment = doc.createDocumentFragment();
    const prevGroups: string[] = [];

    // Add header template
    if (templates?.header) {
      const headerDiv = doc.createElement('div');
      headerDiv.classList.add('tt-header');
      headerDiv.setAttribute('role', 'heading');
      headerDiv.setAttribute('aria-level', '1');
      templatify(headerDiv, templates.header());
      fragment.appendChild(headerDiv);
    }

    // loop over suggestions
    for (const [index, item] of items.entries()) {
      if (index === limitSuggestions) break;

      // attach group if available
      if (item[groupIdentifier] && !prevGroups.includes(item[groupIdentifier] as string)) {
        prevGroups.push(item[groupIdentifier] as string);
        const groupDiv = renderGroup(item[groupIdentifier] as string);
        fragment.appendChild(groupDiv);
      }

      // attach suggestion
      const div = render(item);
      div.addEventListener('click', function (ev: MouseEvent): void {
        clear();
        selected = item;
        input.value = display(item, ev);
        ev.preventDefault();
      });
      if (item === selected) {
        div.classList.add('tt-selected');
        div.setAttribute('aria-selected', 'true');
      }
      fragment.appendChild(div);

      // with the showOnFocus setting the inputValue may not contain content
      // if we have input text then highlight matched text
      config.highlight && inputValue.length > 0 && hightlight(div, inputValue);
    }

    // Add footer template
    if (templates?.footer) {
      const footerDiv = doc.createElement('div');
      footerDiv.classList.add('tt-footer');
      footerDiv.setAttribute('role', 'heading');
      footerDiv.setAttribute('aria-level', '2');
      templatify(footerDiv, templates.footer());
      fragment.appendChild(footerDiv);
    }

    listContainer.appendChild(fragment);

    // update hint if its enabled
    hint && updateHint(selected || items[0]);

    // scroll when not in view
    listContainer.querySelector('.tt-selected')?.scrollIntoView({ block: 'nearest' });

    show();
  };

  const inputEventHandler = (ev: KeyboardEvent): void => {
    const keyCode = ev.code || '';

    if (keyCode === Keys.Down) {
      return;
    }

    storedInput = input.value;
    startFetch();
  };

  /**
   * Select the previous item in suggestions
   */
  const selectPrev = (ev: KeyboardEvent): void => {
    const maxLength = items.length >= limitSuggestions ? limitSuggestions : items.length;
    // if first item is selected and UP Key is pressed, focus input and restore original input
    if (selected === items[0]) {
      selected = undefined;
      input.value = storedInput;
      return;
    }
    // if focus is on input, and UP Key is pressed, select last item
    if (!selected) {
      selected = items[maxLength - 1];
    } else {
      for (let i = maxLength - 1; i > 0; i--) {
        if (selected === items[i] || i === 1) {
          selected = items[i - 1];
          break;
        }
      }
    }

    input.value = display(selected, ev);
  };

  /**
   * Select the next item in suggestions
   */
  const selectNext = (ev: KeyboardEvent): void => {
    const maxLength = items.length >= limitSuggestions ? limitSuggestions : items.length;
    // if nothing selected, select the first suggestion
    if (!selected) {
      selected = items[0];
      input.value = display(selected, ev);
      return;
    }
    // if we're at the end of the list, go to input box and restore original input
    if (selected === items[maxLength - 1]) {
      selected = undefined;
      input.value = storedInput;
      return;
    }

    for (let i = 0; i < maxLength - 1; i++) {
      if (selected === items[i]) {
        selected = items[i + 1];
        break;
      }
    }

    input.value = display(selected, ev);
  };

  const keydownEventHandler = (ev: KeyboardEvent): void => {
    // if raw input is empty, clear out everything
    if (!showOnFocus && !input.value.length) {
      clear();
      return;
    }

    const keyCode = ev.code || '';

    if (keyCode === Keys.Up || keyCode === Keys.Down || keyCode === Keys.Esc) {
      if (keyCode === Keys.Esc) {
        clear();
      } else if (items.length) {
        keyCode === Keys.Up ? selectPrev(ev) : selectNext(ev);
        update();
      }

      ev.preventDefault();
      ev.stopPropagation();

      return;
    }

    const useSelectedValue = function (fallback = false) {
      if (!selected && fallback && items.length) {
        selected = items[0];
      }
      if (selected) {
        clear();
        input.value = display(selected, ev);
        return selected;
      }
    };

    if (keyCode === Keys.Enter) {
      preventSubmit && ev.preventDefault();
      onSubmit(ev, useSelectedValue());

      return;
    }

    if (keyCode === Keys.Tab && isListOpen()) {
      ev.preventDefault();
      useSelectedValue(true);
    }
  };

  const focusEventHandler = (): void => {
    if (prefetch && prefetch.when === 'onFocus') {
      prefetchData();
    }
    if (customSource !== null) {
      // if the source is a function then run on focus
      trie.clear()
      fetchDataFromFn()
    }

    startFetch();

    if (showOnFocus) {
      show()
    }
  };

  const startFetch = (): void => {
    clearRemoteDebounceTimer();
    const val = input.value.replace(/\s{2,}/g, ' ').trim();
    if (showOnFocus || val.length >= minLen) {
      inputValue = val;
      calcSuggestions();

      // if remote source exists, first check remote cache before making any query
      const thumbprint = JSON.stringify(inputValue);
      if (remote && items.length < limitSuggestions && (remoteResponseCache[thumbprint] as [])?.length) {
        calcSuggestions(remoteResponseCache[thumbprint] as []);
      }

      update(); // update view

      remoteDebounceTimer = window.setTimeout(function (): void {
        if (items.length < limitSuggestions && !fetchInProgress) {
          fetchDataFromRemote();
        }
      }, debounceXHR);
    } else {
      inputValue = '';
      clear();
    }
  };

  const formatQuery = (ip = '') => {
    if (config.diacritics) {
      ip = diacritics(ip);
    }

    return ip.toLowerCase();
  };

  const calcSuggestions = (newItems?: T[]): void => {
    // get suggestions
    let suggestions: T[] = trie.search(inputValue, limitSuggestions) as T[];

    if (newItems?.length) {
      newItems.push(...suggestions); // merge suggestions

      const uniqueItems = {} as Dictionary<T>;
      newItems.forEach((item) => {
        uniqueItems[identity(item)] = item;
      });

      suggestions = Object.values(uniqueItems);
    }

    if (customSource !== null) {
      // custom source uses a plain sort by text
      suggestions.sort((a: Dictionary, b: Dictionary) => {
        const one = (a[identifier as string] as string).toLowerCase()
        const two = (b[identifier as string] as string).toLowerCase()
        return one.localeCompare(two)
      })
    } else {
      // sort by starting letter of the query
      sortByStartingLetter(suggestions);
    }

      // if suggestions need to be grouped, sort them by group
    if (groupIdentifier) {
      sortByGroup(suggestions);
    }

    // update items with available suggestions
    items = suggestions;

    selected = undefined; // unselect previously calculated/cached suggestion
    if (autoSelect && items.length) {
      selected = items[0];
    }
  };

  const fetchDataFromRemote = () => {
    if (!remote) return;

    fetchInProgress = true;
    const frozenInput = inputValue;
    const thumbprint = JSON.stringify(frozenInput);

    // check cache, verify input length
    if (remoteQueryCache[thumbprint] || !inputValue.length) {
      fetchInProgress = false;
      noSuggestionsHandler(true);
      return;
    }

    let transformed: T[] = [];

    fetchWrapper
      .get(
        (typeof remote.url === 'function' ? remote.url() : remote.url).replace(remote.wildcard, frozenInput),
        remote?.requestOptions
      )
      .then(
        (data) => {
          transformed = transform(data) as T[];
          transformed = normalizer(transformed, identifier) as T[];
          updateSearchIndex(transformed);
        },
        (reject) => {
          console.error('e05', reject);
        }
      )
      .finally(() => {
        // cache XHR requests so that same calls aren't made multiple times
        remoteQueryCache[thumbprint] = true;
        remoteResponseCache[thumbprint] = transformed || [];
        if (transformed.length && inputValue.length) {
          calcSuggestions(transformed);
          update();
        }
        fetchInProgress = false;

        // make another request if inputVal exists but is different than the last remote request
        if (inputValue.length && frozenInput !== inputValue) {
          fetchDataFromRemote();
        }
        noSuggestionsHandler(true);
      });
  };

  const fetchDataFromFn = () => {
    if (!customSource) return;
    const data = customSource()
    let transformed: T[] = [];
    transformed = transform(data) as T[];
    transformed = normalizer(transformed, identifier) as T[];
    updateSearchIndex(transformed);
    // with the showOnFocus setting the inputValue may not contain content
    if (transformed.length) {
      calcSuggestions(transformed);
      update();
    }
  }

  /**
   * Update the search Index with the identifier + dataTokens
   */
  function updateSearchIndex(iterable: T[]) {
    if (!iterable.length) return;

    // add new items to the search index
    trie.add(iterable, identifier, identity);
    if (dataTokens) {
      dataTokens.forEach((token) => {
        trie.add(iterable, token, identity);
      });
    }
  }

  /**
   * Sorts array in place giving preference to the starting letter of the query
   */
  const sortByStartingLetter = (suggestions: T[]): void => {
    suggestions.sort((a: Dictionary, b: Dictionary) => {
      const one = (a[identifier as string] as string).toLowerCase().startsWith(inputValue.toLowerCase());
      const two = (b[identifier as string] as string).toLowerCase().startsWith(inputValue.toLowerCase());

      if (one && !two) return -1;

      if (one && (a[identifier as string] as string).length < (b[identifier as string] as string).length) {
        return -1;
      }

      return 0;
    });
  };

  /**
   * Sorts(in-place) array by group
   */
  const sortByGroup = (suggestions: T[]) => {
    suggestions.sort((a: Dictionary, b: Dictionary) => {
      if (!a[groupIdentifier] || (a[groupIdentifier] as string) < (b[groupIdentifier] as string)) {
        return -1;
      }
      if ((a[groupIdentifier] as string) > (b[groupIdentifier] as string)) {
        return 1;
      }
      return 0;
    });
  };

  /**
   * Highlights a given text by its pattern
   * @param Elm The listContainer element
   * @param pattern the string to highlight
   */
  const hightlight = (Elm: HTMLElement, pattern: string): void => {
    const getRegex = (query: string, wordsOnly: boolean) => {
      const escapedQuery = escapeRegExp(query);
      const regexStr = wordsOnly ? '\\b(' + escapedQuery + ')\\b' : '(' + escapedQuery + ')';
      return new RegExp(regexStr, 'i');
    };

    const hightlightTextNode = (textNode: Text) => {
      let match = regex.exec(textNode.data);

      // check for diacritics if necessary
      if (config.diacritics && !match) {
        match = regex.exec(diacritics(textNode.data));
      }

      const wrapperNode = doc.createElement('span');
      wrapperNode.className = 'tt-highlight';

      if (match) {
        const patternNode = textNode.splitText(match.index);
        patternNode.splitText(match[0].length);
        wrapperNode.appendChild(patternNode.cloneNode(true));

        textNode?.parentNode?.replaceChild(wrapperNode, patternNode);
      }

      return !!match;
    };

    const traverse = (el: HTMLElement | ChildNode, hightlightTextNode: (textNode: Text) => boolean) => {
      const TEXT_NODE_TYPE = 3;
      let childNode;

      for (let i = 0; i < el.childNodes.length; i++) {
        childNode = el.childNodes[i];

        if (childNode.nodeType === TEXT_NODE_TYPE) {
          i += hightlightTextNode(childNode as Text) ? 1 : 0;
        } else {
          traverse(childNode, hightlightTextNode);
        }
      }
    };

    const regex = getRegex(pattern, false);
    traverse(Elm, hightlightTextNode);
  };

  /**
   * injects Hint input element into the DOM
   * @param inputHint the input hint element
   */
  function injectHintEl(inputHint: HTMLInputElement) {
    ['id', 'name', 'placeholder', 'required'].forEach((attr) => inputHint.removeAttribute(attr));
    inputHint.setAttribute('readonly', 'true');
    inputHint.setAttribute('aria-hidden', 'true');
    inputHint.tabIndex = -1;
    inputHint.className = 'tt-hint';

    input.after(inputHint);
  }

  /**
   * Updates the value of hint
   * @param selectedItem The selected item
   */
  const updateHint = (selectedItem: T) => {
    const rawInput = input.value;

    // if raw string is not part of suggestion, hide the hint
    if (
      display(selectedItem) === rawInput || // if input string is exactly the same as selectedItem
      formatQuery(display(selectedItem)).indexOf(
        formatQuery(rawInput)
          .replace(/\s{2,}/g, ' ')
          .trimStart()
      ) !== 0
    ) {
      inputHint.value = '';
    } else {
      const item = display(selectedItem);
      const regex = new RegExp(escapeRegExp(inputValue), 'i');
      let match = regex.exec(item);

      // check for diacritics if necessary
      if (config.diacritics && !match) {
        match = regex.exec(diacritics(item));
      }

      if (match) {
        inputHint.value = (rawInput.replace(/\s?$/, '') + item.substring(match[0].length)) as string;
      }
    }
  };

  /**
   * Creates and appends a template to an HTMLElement
   * @param El The html element that the template should attach to
   * @param data The raw string representation of the html template
   */
  const templatify = (El: HTMLElement | DocumentFragment, data: string) => {
    const template = doc.createElement('template');
    template.innerHTML = data;
    El.appendChild(template.content);
  };

  const blurEventHandler = (): void => {
    // we need to delay clear, because when we click on an item, blur will be called before click and remove items from DOM
    setTimeout(() => {
      if (doc.activeElement !== input) {
        clear();
      }
    }, 50);
  };

  /**
   * Handle Long clicks
   */
  listContainer.addEventListener('mousedown', function (e: Event) {
    e.stopPropagation();
    e.preventDefault();
  });

  /**
   * This function will remove DOM elements and clear event handlers
   */
  const destroy = (): void => {
    clearRemoteDebounceTimer();
    wrapper.replaceWith(input.cloneNode());
  };

  // setup event handlers
  input.addEventListener('keydown', keydownEventHandler);
  input.addEventListener('input', inputEventHandler as EventListenerOrEventListenerObject);
  input.addEventListener('blur', blurEventHandler);
  input.addEventListener('focus', focusEventHandler);

  return {
    destroy,
    // trie: Trie, // we expose trie only for local tests
  };
}
