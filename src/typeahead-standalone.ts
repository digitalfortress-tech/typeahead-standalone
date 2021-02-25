/*
 * https://github.com/niketpathak/typeahead-standalone
 * Copyright (c) 2020 Niket Pathak
 * MIT License
 */

import type { typeaheadItem, typeaheadResult, typeaheadConfig, typeaheadHtmlTemplates } from './types';
import { Keys } from './constants';
import { escapeRegExp, normalizer, onSelectCb } from './helpers';
import { fetchWrapper } from './fetchWrapper/fetchWrapper';
import { Trie } from './trie/trie';
import { ls } from './ls/ls';
import './style.less';

export default function typeahead<T extends typeaheadItem>(config: typeaheadConfig<T>): typeaheadResult {
  const doc = document;

  const listContainer: HTMLDivElement = doc.createElement('div');
  const listContainerStyle = listContainer.style;
  const debounceGlobal = 10;
  const debounceXHR = config.debounceRemote || 100;
  const preventSubmit = config.preventSubmit || false;
  const minLen = config.minLength || 1;
  const limitSuggestions = config.limit || 5;
  const hint = config.hint === false ? false : true;
  const templates: typeaheadHtmlTemplates<T> | undefined = config.templates;
  const trie = new (Trie as any)();
  const onSelect: (item: T, input: HTMLInputElement) => void = config.onSelect || onSelectCb;
  const identifier = config.source?.identifier || '';
  const normalize = config.normalizer || normalizer;
  const remoteXhrCache: Record<string, unknown> = {};
  const transform = config.source?.transform || null;
  const remote =
    config.source && config.source.remote && config.source.remote.url && config.source.remote.wildcard
      ? config.source.remote
      : null;
  const prefetch =
    config.source?.prefetch && config.source.prefetch.url
      ? { ...{ startEvent: 'onInit', done: false }, ...config.source.prefetch }
      : null;
  const cache = config.source?.cache?.enable ? { ttl: 864e5, ...config.source.cache } : { enable: false, ttl: 864e5 };

  let items: T[] = []; // suggestions
  let dataStore: T[] = [];
  let inputValue = '';
  let selected: T | undefined;
  let debounceTimer: number | undefined;
  let remoteDebounceTimer: number | undefined;
  let fetchInProgress = false;
  let prefetchCached: T[] | undefined;

  // init templates if they exist
  if (templates) {
    templates.header = templates.header?.trim();
    templates.footer = templates.footer?.trim();
    templates.notFound = templates.notFound?.trim();
    templates.group = templates.group && typeof templates.group === 'function' ? templates.group : undefined;
  }

  if (!config.input) {
    throw new Error('input undefined');
  }

  if (!config.source?.local && !config.source?.prefetch && !config.source?.remote) {
    throw new Error('data source undefined');
  }

  if (cache.enable) {
    ls.flush();
    prefetchCached = ls.get('typeahead_prefetch') as T[];
    dataStore = prefetchCached ? (prefetchCached as T[]) : [];
  }

  if (config.source?.local) {
    updateDataStore(normalize(config.source.local, identifier) as T[]);
  }

  // update Trie
  trie.addAll(dataStore);

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

  if (prefetch && prefetch.startEvent === 'onInit') {
    prefetchData();
  }

  function prefetchData() {
    // check if data was already prefetched for current session or if prefetch response was cached in LS
    if (!prefetch || prefetch.done || prefetchCached) return;

    let transformed: T[] = [];

    fetchWrapper
      .get(prefetch.url)
      .then(
        (data) => {
          if (transform) {
            transformed = transform(data) as T[];
          }
          transformed = normalize(data, identifier) as T[];
          trie.addAll(transformed);
        },
        (reject) => {
          console.error('Prefetch failed - ', reject);
        }
      )
      .finally(() => {
        updateDataStore(transformed, 'prefetch');
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
    listContainerStyle.top = `${input.clientHeight}px`; // or top: '100%'
    listContainerStyle.left = '0';
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
        templatify(empty, templates.notFound || '');
        listContainer.appendChild(empty);
      };

      if (!remote) {
        renderNotFoundTemplate();
      } else if (
        (inputValue && asyncRender && !fetchInProgress) ||
        (inputValue && remoteXhrCache[JSON.stringify(inputValue)])
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
   * Redraw the typeahead div element with suggestions
   */
  function update(): void {
    // No Matches
    if (noSuggestionsHandler()) return;

    clearListDOM();

    // function for rendering typeahead suggestions
    const render = function (item: T): HTMLDivElement | undefined {
      const itemElement = doc.createElement('div');
      itemElement.classList.add('tt-suggestion');
      if (templates?.suggestion && typeof templates.suggestion === 'function') {
        templatify(itemElement, templates?.suggestion(item));
      } else {
        itemElement.textContent = item.label || '';
      }
      return itemElement;
    };

    // function to render typeahead groups
    const renderGroup = function (groupName: string): HTMLDivElement | undefined {
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
    let prevGroup = '#9?$';

    // Add header template
    if (templates?.header) {
      const headerDiv = doc.createElement('div');
      headerDiv.classList.add('tt-header');
      templatify(headerDiv, templates.header);
      fragment.appendChild(headerDiv);
    }

    // loop over suggestions
    for (const [index, item] of items.entries()) {
      if (index === limitSuggestions) break;
      if (item.group && item.group !== prevGroup) {
        prevGroup = item.group;
        const groupDiv = renderGroup(item.group);
        if (groupDiv) {
          fragment.appendChild(groupDiv);
        }
      }
      const div = render(item);
      if (div) {
        div.addEventListener('click', function (ev: MouseEvent): void {
          onSelect(item, input);
          clear();
          ev.preventDefault();
          ev.stopPropagation();
        });
        if (item === selected) {
          div.classList.add('tt-selected');
          hint && updateHint(item);
        }
        fragment.appendChild(div);

        // highlight matched text
        config.highlight && hightlight(div, inputValue.split(' '));
      }
    }

    // Add footer template
    if (templates?.footer) {
      const footerDiv = doc.createElement('div');
      footerDiv.classList.add('tt-footer');
      templatify(footerDiv, templates.footer);
      fragment.appendChild(footerDiv);
    }

    listContainer.appendChild(fragment);

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
    if (items.length < 1) {
      selected = undefined;
    } else {
      const maxLength = items.length >= limitSuggestions ? limitSuggestions : items.length;
      if (selected === items[0]) {
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
  }

  /**
   * Select the next item in suggestions
   */
  function selectNext(): void {
    if (items.length < 1) {
      selected = undefined;
    }
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

    const useSelectedValue = function () {
      if (selected) {
        onSelect(selected, input);
        clear();
      }
    };

    if (keyCode === Keys.Enter) {
      useSelectedValue();
      preventSubmit && ev.preventDefault();

      return;
    }

    if (keyCode === Keys.Tab && containerDisplayed()) {
      ev.preventDefault();
      useSelectedValue();
    }
  }

  function focusEventHandler(): void {
    if (prefetch && prefetch.startEvent === 'onFocus') {
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
        update();
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

  function calcSuggestions(fromRemoteCb = false) {
    let suggestions: T[] = [];

    // if searching within remote or (local + remote), merge the suggestions
    if (fromRemoteCb) {
      suggestions = trie.find(inputValue.toLowerCase(), limitSuggestions - items.length);
      suggestions = [...items, ...suggestions];
    } else {
      // if searching only within local
      suggestions = trie.find(inputValue.toLowerCase(), limitSuggestions);
    }

    // remove duplicates from suggestions to allow back-filling
    items = [...new Map(suggestions.map((item) => [item['label'], item])).values()];

    // set selected item
    if (items.length) {
      selected = items[0];
    }
  }

  function fetchDataFromRemote() {
    if (!remote) return;

    fetchInProgress = true;
    const frozenInput = inputValue;
    const thumbprint = JSON.stringify(frozenInput);

    // check cache, verify input length
    if (remoteXhrCache[thumbprint] || !inputValue.length) {
      fetchInProgress = false;
      noSuggestionsHandler(true);
      return;
    }

    let transformed: T[] = [];

    fetchWrapper
      .get(remote.url.replace(remote.wildcard, frozenInput))
      .then(
        (data) => {
          if (transform) {
            transformed = transform(data) as T[];
          }
          transformed = normalize(data, identifier) as T[];
          trie.addAll(transformed);
        },
        (reject) => {
          console.error('Request failed - ', reject);
        }
      )
      .finally(() => {
        // cache XHR requests so that same calls aren't made multiple times
        remoteXhrCache[thumbprint] = true;
        if (transformed.length && inputValue.length) {
          calcSuggestions(true);
          update();
          updateDataStore(transformed, 'remote');
        }
        fetchInProgress = false;

        // make another request if inputVal exists but is different than the last remote request
        if (inputValue.length && frozenInput !== inputValue) {
          fetchDataFromRemote();
        }
        noSuggestionsHandler(true);
      });
  }

  function updateDataStore(iterable: T[], source = 'local') {
    dataStore = [...dataStore, ...iterable];
    dataStore = [...new Map(dataStore.map((item) => [item['label'], item])).values()]; // remove duplicates

    // Add to cache
    if (cache.enable) {
      if (source === 'prefetch') {
        ls.set('typeahead_prefetch', dataStore, cache.ttl);
      } else if (source === 'remote') {
        // @todo: handle remote cache
      }
    }
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
    inputHint.removeAttribute('id');
    inputHint.removeAttribute('placeholder');
    inputHint.setAttribute('readonly', 'true');
    inputHint.tabIndex = -1;
    inputHint.classList.add('tt-hint');
    inputHint.classList.remove('tt-input');

    input.after(inputHint);
  }

  /**
   * Updates the value of hint
   * @param selectedItem The selected item
   */
  function updateHint(selectedItem: T) {
    const rawInput = input.value;

    // if last char is a space, hide the hint
    if (' ' === rawInput.split('').pop()) {
      inputHint.value = '';
    } else {
      inputHint.value = (rawInput + selectedItem.label.replace(new RegExp(inputValue, 'i'), '')) as string;
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
   * Fixes #26: on long clicks focus will be lost and onSelect method will not be called
   */
  listContainer.addEventListener('mousedown', function (evt: Event) {
    evt.stopPropagation();
    evt.preventDefault();
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
  };
}
