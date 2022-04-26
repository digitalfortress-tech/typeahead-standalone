/*
 * https://github.com/digitalfortress-tech/typeahead-standalone
 * Copyright (c) 2020 Niket Pathak
 * MIT License
 */

import type { typeaheadResult, typeaheadConfig, typeaheadHtmlTemplates, Dictionary } from './types';
import { Keys } from './constants';
import { deduplicateArr, escapeRegExp, NOOP, normalizer } from './helpers';
import { fetchWrapper } from './fetchWrapper/fetchWrapper';
import { Trie } from './trie/trie';
import './style.less';

export default function typeahead<T extends Dictionary>(config: typeaheadConfig<T>): typeaheadResult {
  const doc = document;

  const listContainer: HTMLDivElement = doc.createElement('div');
  const listContainerStyle = listContainer.style;
  const debounceGlobal = 10;
  const debounceXHR = config.debounceRemote || 100;
  const preventSubmit = config.preventSubmit || false;
  const minLen = config.minLength || 1;
  const limitSuggestions = config.limit || 5;
  const hint = config.hint === false ? false : true;
  const autoSelect = config.autoSelect || false;
  const templates: typeaheadHtmlTemplates<T> | undefined = config.templates;
  const trie = new (Trie as any)();
  const identifier = config.source?.identifier || 'label'; // label is the default identifier
  const groupIdentifier = config.source?.groupIdentifier || '';
  const displayCb = <T extends Dictionary>(item: T): string => {
    return `${item[identifier]}`;
  };
  const display: (item: T) => string = config.display || displayCb;
  const onSubmit: (e: Event, item?: T) => void = config.onSubmit || NOOP;
  const dataTokens =
    config.source?.dataTokens && config.source.dataTokens.constructor === Array ? config.source.dataTokens : undefined;
  const remoteQueryCache: Dictionary = {};
  const remoteResponseCache: Dictionary = {};
  const transform = config.source?.transform || ((data) => data);
  const local = config.source?.local || null;
  const remote =
    config.source && config.source.remote && config.source.remote.url && config.source.remote.wildcard
      ? config.source.remote
      : null;
  const prefetch =
    config.source?.prefetch && config.source.prefetch.url
      ? { ...{ when: 'onInit', done: false }, ...config.source.prefetch }
      : null;

  let items: T[] = []; // suggestions
  let inputValue = '';
  let selected: T | undefined;
  let debounceTimer: number | undefined;
  let remoteDebounceTimer: number | undefined;
  let fetchInProgress = false;

  // init templates if they exist
  if (templates) {
    templates.header = typeof templates.header === 'function' ? templates.header : undefined;
    templates.footer = typeof templates.footer === 'function' ? templates.footer : undefined;
    templates.notFound = typeof templates.notFound === 'function' ? templates.notFound : undefined;
    templates.group = typeof templates.group === 'function' ? templates.group : undefined;
    templates.suggestion = typeof templates.suggestion === 'function' ? templates.suggestion : undefined;
  }

  if (!config.input) {
    throw new Error('e01');
  }

  if (!local && !prefetch && !remote) {
    throw new Error('e02');
  }

  if (local) {
    updateSearchIndex(deduplicateArr(normalizer(local, identifier) as T[], identifier) as T[]);
  }

  let input: HTMLInputElement = config.input;

  // main wrapper
  const wrapper: HTMLSpanElement = doc.createElement('span');
  wrapper.className = 'typeahead-standalone' + (config.className ? ` ${config.className}` : '');

  const inputClone: HTMLElement = input.cloneNode(true) as HTMLElement;
  inputClone.classList.add('tt-input');

  wrapper.appendChild(inputClone);

  input.replaceWith(wrapper);
  input = wrapper.firstChild as HTMLInputElement;

  // generate markup for hints
  const inputHint: HTMLInputElement = input.cloneNode() as HTMLInputElement;
  injectHintEl(inputHint);

  listContainer.classList.add('tt-list');

  // IOS implementation for fixed positioning has many bugs, so we will use absolute positioning
  listContainerStyle.position = 'absolute';

  attachListContainer();

  if (prefetch && prefetch.when === 'onInit') {
    prefetchData();
  }

  function prefetchData() {
    // check if data was already prefetched for current session
    if (!prefetch || prefetch.done) return;

    let transformed: T[] = [];

    fetchWrapper
      .get(prefetch.url, prefetch?.requestOptions)
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
  function show(): void {
    listContainer.classList.remove('tt-hide');
  }

  /**
   * Hides the listContainer from DOM
   */
  function hide(): void {
    listContainer.classList.add('tt-hide');
  }

  /**
   * Clear debounce timer if assigned
   */
  function clearDebounceTimer(): void {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
  }

  /**
   * Clear remote debounce timer if assigned
   */
  function clearRemoteDebounceTimer(): void {
    if (remoteDebounceTimer) {
      window.clearTimeout(remoteDebounceTimer);
    }
  }

  /**
   * Check if listContainer for typeahead is displayed
   */
  function containerDisplayed(): boolean {
    return listContainer.style.display !== 'none';
  }

  /**
   * Clear typeahead state and hide listContainer
   */
  function clear(): void {
    items = [];
    inputHint.value = '';
    selected = undefined;
    hide();
  }

  /**
   * Attaches list container to the DOM and styles it
   */
  function attachListContainer(): void {
    wrapper.appendChild(listContainer);

    // hide search results initially
    listContainer.classList.add('tt-hide');

    // fix position of listContainer
    listContainerStyle.width = '100%';
    listContainerStyle.left = '0';
    // listContainerStyle.top = `${input.clientHeight}px`; // or top: '100%' // not required apparently
  }

  /**
   * Displays the NotFound template if it exists, otherwise, does nothing (i.e. returns true)
   * @param asyncRender set to true for asyncRenders
   * @returns true if no suggestions are found, else returns undefined
   */
  function noSuggestionsHandler(asyncRender = false) {
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
  }

  /**
   * Delete all children from typeahead DOM listContainer
   */
  function clearListDOM() {
    while (listContainer.firstChild) {
      listContainer.firstChild.remove();
    }
  }

  /**
   * Responsible for drawing/updating the view
   */
  function update(): void {
    // No Matches
    if (noSuggestionsHandler()) return;

    clearListDOM();

    // function for rendering typeahead suggestions
    const render = (item: T): HTMLDivElement | undefined => {
      const itemElement = doc.createElement('div');
      itemElement.classList.add('tt-suggestion');
      if (templates?.suggestion) {
        templatify(itemElement, templates.suggestion(item));
      } else {
        itemElement.textContent = (item[identifier] as string) || '';
      }
      return itemElement;
    };

    // function to render typeahead groups
    const renderGroup = (groupName: string): HTMLDivElement | undefined => {
      const groupDiv = doc.createElement('div');
      groupDiv.classList.add('tt-group');
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
      templatify(headerDiv, templates.header());
      fragment.appendChild(headerDiv);
    }

    // loop over suggestions
    for (const [index, item] of items.entries()) {
      if (index === limitSuggestions) break;
      if (item[groupIdentifier] && !prevGroups.includes(item[groupIdentifier] as string)) {
        prevGroups.push(item[groupIdentifier] as string);
        const groupDiv = renderGroup(item[groupIdentifier] as string);
        if (groupDiv) {
          fragment.appendChild(groupDiv);
        }
      }
      const div = render(item);
      if (div) {
        div.addEventListener('click', function (ev: MouseEvent): void {
          clear();
          input.value = display(item);
          ev.preventDefault();
        });
        if (item === selected) {
          div.classList.add('tt-selected');
        }
        fragment.appendChild(div);

        // highlight matched text
        config.highlight && hightlight(div, [inputValue]);
      }
    }

    // Add footer template
    if (templates?.footer) {
      const footerDiv = doc.createElement('div');
      footerDiv.classList.add('tt-footer');
      templatify(footerDiv, templates.footer());
      fragment.appendChild(footerDiv);
    }

    listContainer.appendChild(fragment);

    if (hint) {
      // update hint if its enabled
      if (selected) updateHint(selected);
      else updateHint(items[0]);
    }

    show();
  }

  function inputEventHandler(ev: KeyboardEvent): void {
    const keyCode = ev.which || ev.keyCode || 0;

    if (keyCode === Keys.Down && containerDisplayed()) {
      return;
    }

    startFetch();
  }

  /**
   * Select the previous item in suggestions
   */
  function selectPrev(): void {
    const maxLength = items.length >= limitSuggestions ? limitSuggestions : items.length;
    if (!selected || selected === items[0]) {
      selected = items[maxLength - 1];
    } else {
      for (let i = maxLength - 1; i > 0; i--) {
        if (selected === items[i] || i === 1) {
          selected = items[i - 1];
          break;
        }
      }
    }
  }

  /**
   * Select the next item in suggestions
   */
  function selectNext(): void {
    const maxLength = items.length >= limitSuggestions ? limitSuggestions : items.length;
    if (!selected || selected === items[maxLength - 1]) {
      selected = items[0];
      return;
    }
    for (let i = 0; i < maxLength - 1; i++) {
      if (selected === items[i]) {
        selected = items[i + 1];
        break;
      }
    }
  }

  function keydownEventHandler(ev: KeyboardEvent): void {
    // if raw input is empty, clear out everything
    if (!input.value.length) {
      clear();
      return;
    }

    const keyCode = ev.which || ev.keyCode || 0;

    if (keyCode === Keys.Up || keyCode === Keys.Down || keyCode === Keys.Esc) {
      const containerVisible = containerDisplayed();

      if (keyCode === Keys.Esc) {
        clear();
      } else {
        if (!containerVisible || items.length < 1) {
          return;
        }
        keyCode === Keys.Up ? selectPrev() : selectNext();
        update();
      }

      ev.preventDefault();
      if (containerVisible) {
        ev.stopPropagation();
      }

      return;
    }

    const useSelectedValue = function (fallback = false) {
      if (!selected && fallback && items.length) {
        selected = items[0];
      }
      if (selected) {
        const item = selected;
        clear();
        input.value = display(item);
        return item;
      }
    };

    if (keyCode === Keys.Enter) {
      const selectedItem = useSelectedValue();
      preventSubmit && ev.preventDefault();
      onSubmit(ev, selectedItem);

      return;
    }

    if (keyCode === Keys.Tab && containerDisplayed()) {
      ev.preventDefault();
      useSelectedValue(true);
    }
  }

  function focusEventHandler(): void {
    if (prefetch && prefetch.when === 'onFocus') {
      prefetchData();
    }
    startFetch();
  }

  function startFetch() {
    clearDebounceTimer();
    clearRemoteDebounceTimer();
    const val = input.value.replace(/\s{2,}/g, ' ').trim();
    if (val.length >= minLen) {
      debounceTimer = window.setTimeout(function (): void {
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
      }, debounceGlobal);
    } else {
      inputValue = '';
      clear();
    }
  }

  function calcSuggestions(newItems?: T[]) {
    // get suggestions
    let suggestions: T[] = trie.search(inputValue.toLowerCase(), identifier, limitSuggestions);

    // remove duplicates from suggestions to allow back-filling
    suggestions = deduplicateArr(suggestions, identifier) as T[];

    if (newItems?.length) {
      suggestions = [...suggestions, ...newItems];
      suggestions = deduplicateArr(suggestions, identifier) as T[];
    }

    // if suggestions need to be grouped, sort them by group, else sort by starting letter of the query
    if (groupIdentifier) {
      sortByGroup(suggestions);
    } else {
      sortByStartingLetter(suggestions);
    }

    // update items with available suggestions
    items = suggestions;

    if (autoSelect && items.length) {
      selected = items[0];
    }
  }

  function fetchDataFromRemote() {
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
      .get(remote.url.replace(remote.wildcard, frozenInput), remote?.requestOptions)
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
  }

  /**
   * Update the search Index with the identifier + dataTokens
   */
  function updateSearchIndex(iterable: T[]) {
    if (!iterable.length) return;

    // add new items to the search index
    trie.add(iterable, identifier);
    if (dataTokens) {
      dataTokens.forEach((token) => {
        trie.add(iterable, token);
      });
    }
  }

  /**
   * Sorts array in place giving preference to the starting letter of the query
   */
  function sortByStartingLetter(suggestions: T[]) {
    suggestions.sort((a: Dictionary, b: Dictionary) => {
      const one = (a[identifier as string] as string).toLowerCase().startsWith(inputValue.toLowerCase());
      const two = (b[identifier as string] as string).toLowerCase().startsWith(inputValue.toLowerCase());
      // @todo: test with dark blue
      // @todo: test with blue dark
      if (one && !two) return -1;

      if (one && (a[identifier as string] as string).length < (b[identifier as string] as string).length) {
        return -1;
      }

      return 0;
    });
  }

  /**
   * Sorts(in-place) array by group
   */
  function sortByGroup(suggestions: T[]) {
    suggestions.sort((a: Dictionary, b: Dictionary) => {
      if (!a[groupIdentifier] || (a[groupIdentifier] as string) < (b[groupIdentifier] as string)) {
        return -1;
      }
      if ((a[groupIdentifier] as string) > (b[groupIdentifier] as string)) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * Highlights a given text by its pattern
   * @param Elm The listContainer element
   * @param pattern the string to highlight
   */
  function hightlight(Elm: HTMLElement, pattern: string[]) {
    const getRegex = function (patterns: string[], wordsOnly: boolean) {
      const escapedPatterns = [];

      for (let i = 0, len = patterns.length; i < len; i++) {
        const escapedWord = escapeRegExp(patterns[i]);
        // @todo: add support diacritic insensitivity
        // if (diacriticInsensitive) {
        //   escapedWord = escapedWord.replace(/\S/g, accent_replacer);
        // }
        escapedPatterns.push(escapedWord);
      }
      const regexStr = wordsOnly ? '\\b(' + escapedPatterns.join('|') + ')\\b' : '(' + escapedPatterns.join('|') + ')';
      return new RegExp(regexStr, 'i');
    };

    const hightlightTextNode = function (textNode: Text) {
      const match = regex.exec(textNode.data);

      const wrapperNode = doc.createElement('span');
      wrapperNode.className = 'tt-highlight';

      if (match) {
        const patternNode = textNode.splitText(match.index);
        patternNode.splitText(match[0].length);
        wrapperNode.appendChild(patternNode.cloneNode(true));

        textNode && textNode.parentNode && textNode.parentNode.replaceChild(wrapperNode, patternNode);
      }

      return !!match;
    };

    const traverse = function (el: HTMLElement | ChildNode, hightlightTextNode: (textNode: Text) => boolean) {
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
  }

  /**
   * injects Hint input element into the DOM
   * @param inputHint the input hint element
   */
  function injectHintEl(inputHint: HTMLInputElement) {
    ['id', 'name', 'placeholder'].forEach((attr) => inputHint.removeAttribute(attr));
    inputHint.setAttribute('readonly', 'true');
    inputHint.tabIndex = -1;
    inputHint.className = 'tt-hint';

    input.after(inputHint);
  }

  /**
   * Updates the value of hint
   * @param selectedItem The selected item
   */
  function updateHint(selectedItem: T) {
    const rawInput = input.value;

    // if raw string is not part of suggestion, hide the hint
    if (
      (selectedItem[identifier] as string).toLocaleLowerCase().indexOf(
        rawInput
          .replace(/\s{2,}/g, ' ')
          .trimStart()
          .toLocaleLowerCase()
      ) !== 0
    ) {
      inputHint.value = '';
    } else {
      inputHint.value = (rawInput.replace(/\s?$/, '') +
        display(selectedItem).replace(new RegExp(inputValue, 'i'), '')) as string;
    }
  }

  /**
   * Creates and appends a template to an HTMLElement
   * @param El The html element that the template should attach to
   * @param data The raw string representation of the html template
   */
  function templatify(El: HTMLElement | DocumentFragment, data: string) {
    const template = doc.createElement('template');
    template.innerHTML = data;
    El.appendChild(template.content);
  }

  function blurEventHandler(): void {
    // we need to delay clear, because when we click on an item, blur will be called before click and remove items from DOM
    setTimeout(() => {
      if (doc.activeElement !== input) {
        clear();
      }
    }, 50);
  }

  /**
   * Fixes #26: on long clicks focus will be lost and display method will not be called
   */
  listContainer.addEventListener('mousedown', function (e: Event) {
    e.stopPropagation();
    e.preventDefault();
  });

  /**
   * Fixes #30: typeahead closes when scrollbar is clicked in IE
   * See: https://stackoverflow.com/a/9210267/13172349
   */
  listContainer.addEventListener('focus', () => input.focus());

  /**
   * This function will remove DOM elements and clear event handlers
   */
  function destroy(): void {
    clearDebounceTimer();
    clearRemoteDebounceTimer();
    wrapper.replaceWith(input.cloneNode());
  }

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
