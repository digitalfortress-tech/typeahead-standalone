/*
 * https://github.com/niketpathak/typeahead-standalone
 * Copyright (c) 2020 Niket Pathak
 * MIT License
 */

import type { typeaheadItem, typeaheadResult, typeaheadConfig } from './types';
import { EventTrigger, Keys } from './constants';
import { NOOP } from './helpers';
import './style.less';

export default function typeahead<T extends typeaheadItem>(config: typeaheadConfig<T>): typeaheadResult {
  const doc = document;

  const container: HTMLDivElement = doc.createElement('div');
  const containerStyle = container.style;
  const userAgent = navigator.userAgent;
  const mobileFirefox = userAgent.indexOf('Firefox') !== -1 && userAgent.indexOf('Mobile') !== -1;
  const debounceWaitMs = config.debounceWaitMs || 0;
  const preventSubmit = config.preventSubmit || false;
  const minLen = config.minLength || 1;

  // 'keyup' event will not be fired on Mobile Firefox, so we have to use 'input' event instead
  const keyUpEventName = mobileFirefox ? 'input' : 'keyup';

  let items: T[] = [];
  let inputValue = '';
  const showOnFocus = config.showOnFocus;
  let selected: T | undefined;
  let keypressCounter = 0;
  let debounceTimer: number | undefined;
  let onSelect: Function = NOOP;

  if (!config.input) {
    throw new Error('input undefined');
  }

  const input: HTMLInputElement = config.input;

  container.className = 'typeahead-standalone ' + (config.className || '');

  // IOS implementation for fixed positioning has many bugs, so we will use absolute positioning
  containerStyle.position = 'absolute';

  /**
   * Detach the container from DOM
   */
  function detach(): void {
    const parent = container.parentNode;
    if (parent) {
      parent.removeChild(container);
    }
  }

  /**
   * Clear debouncing timer if assigned
   */
  function clearDebounceTimer(): void {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
  }

  /**
   * Attach the container to DOM
   */
  function attach(): void {
    if (!container.parentNode) {
      doc.body.appendChild(container);
    }
  }

  /**
   * Check if container for typeahead is displayed
   */
  function containerDisplayed(): boolean {
    return !!container.parentNode;
  }

  /**
   * Clear typeahead state and hide container
   */
  function clear(): void {
    // prevent the update call if there are pending AJAX requests
    keypressCounter++;

    items = [];
    inputValue = '';
    selected = undefined;
    detach();
  }

  /**
   * Update typeahead position
   */
  function updatePosition(): void {
    if (!containerDisplayed()) {
      return;
    }

    containerStyle.height = 'auto';
    containerStyle.width = input.offsetWidth + 'px';

    let maxHeight = 0;
    let inputRect: ClientRect | DOMRect | undefined;

    function calc() {
      const docEl = doc.documentElement as HTMLElement;
      const clientTop = docEl.clientTop || doc.body.clientTop || 0;
      const clientLeft = docEl.clientLeft || doc.body.clientLeft || 0;
      const scrollTop = window.pageYOffset || docEl.scrollTop;
      const scrollLeft = window.pageXOffset || docEl.scrollLeft;

      inputRect = input.getBoundingClientRect();

      const top = inputRect.top + input.offsetHeight + scrollTop - clientTop;
      const left = inputRect.left + scrollLeft - clientLeft;

      containerStyle.top = top + 'px';
      containerStyle.left = left + 'px';

      maxHeight = window.innerHeight - (inputRect.top + input.offsetHeight);

      if (maxHeight < 0) {
        maxHeight = 0;
      }

      containerStyle.top = top + 'px';
      containerStyle.bottom = '';
      containerStyle.left = left + 'px';
      containerStyle.maxHeight = maxHeight + 'px';
    }

    // the calc method must be called twice, otherwise the calculation may be wrong on resize event (chrome browser)
    calc();
    calc();

    if (config.customize && inputRect) {
      config.customize(input, inputRect, container, maxHeight);
    }
  }

  /**
   * Redraw the typeahead div element with suggestions
   */
  function update(): void {
    // delete all children from typeahead DOM container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // function for rendering typeahead suggestions
    let render = function (item: T, currentValue: string): HTMLDivElement | undefined {
      const itemElement = doc.createElement('div');
      itemElement.classList.add('tt-suggestion');
      itemElement.textContent = item.label || '';
      return itemElement;
    };
    if (config.render) {
      render = config.render;
    }

    // function to render typeahead groups
    let renderGroup = function (groupName: string, currentValue: string): HTMLDivElement | undefined {
      const groupDiv = doc.createElement('div');
      groupDiv.classList.add('tt-group');
      groupDiv.textContent = groupName;
      return groupDiv;
    };
    if (config.renderGroup) {
      renderGroup = config.renderGroup;
    }

    onSelect = function (item: T, input: HTMLInputElement) {
      input.value = item.label || '';
    }
    if (config.onSelect) {
      onSelect = config.onSelect;
    }

    const fragment = doc.createDocumentFragment();
    let prevGroup = '#9?$';

    items.forEach(function (item: T): void {
      if (item.group && item.group !== prevGroup) {
        prevGroup = item.group;
        const groupDiv = renderGroup(item.group, inputValue);
        if (groupDiv) {
          fragment.appendChild(groupDiv);
        }
      }
      const div = render(item, inputValue);
      if (div) {
        div.addEventListener('click', function (ev: MouseEvent): void {
          onSelect(item, input);
          clear();
          ev.preventDefault();
          ev.stopPropagation();
        });
        if (item === selected) {
          div.classList.add('tt-selected');
        }
        fragment.appendChild(div);
      }
    });

    container.appendChild(fragment);
    if (items.length < 1) {
      if (config.emptyMsg) {
        const empty = doc.createElement('div');
        empty.classList.add('tt-empty');
        empty.textContent = config.emptyMsg;
        container.appendChild(empty);
      } else {
        clear();
        return;
      }
    }

    attach();
    updatePosition();
    updateScroll();
  }

  function updateIfDisplayed(): void {
    if (containerDisplayed()) {
      update();
    }
  }

  function resizeEventHandler(): void {
    updateIfDisplayed();
  }

  function scrollEventHandler(e: Event): void {
    if (e.target !== container) {
      updateIfDisplayed();
    } else {
      e.preventDefault();
    }
  }

  function keyupEventHandler(ev: KeyboardEvent): void {
    const keyCode = ev.which || ev.keyCode || 0;

    const ignore = [
      Keys.Up,
      Keys.Enter,
      Keys.Esc,
      Keys.Right,
      Keys.Left,
      Keys.Shift,
      Keys.Ctrl,
      Keys.Alt,
      Keys.CapsLock,
      Keys.WindowsKey,
      Keys.Tab,
    ];
    for (const key of ignore) {
      if (keyCode === key) {
        return;
      }
    }

    if (keyCode >= Keys.F1 && keyCode <= Keys.F12) {
      return;
    }

    // the down key is used to open typeahead
    if (keyCode === Keys.Down && containerDisplayed()) {
      return;
    }

    startFetch(EventTrigger.Keyboard);
  }

  /**
   * Automatically move scroll bar if selected item is not visible
   */
  function updateScroll(): void {
    const elements = container.getElementsByClassName('tt-selected');
    if (elements.length > 0) {
      let element = elements[0] as HTMLDivElement;

      // make group visible
      const previous = element.previousElementSibling as HTMLDivElement;
      if (previous && previous.className.indexOf('tt-group') !== -1 && !previous.previousElementSibling) {
        element = previous;
      }

      if (element.offsetTop < container.scrollTop) {
        container.scrollTop = element.offsetTop;
      } else {
        const selectBottom = element.offsetTop + element.offsetHeight;
        const containerBottom = container.scrollTop + container.offsetHeight;
        if (selectBottom > containerBottom) {
          container.scrollTop += selectBottom - containerBottom;
        }
      }
    }
  }

  /**
   * Select the previous item in suggestions
   */
  function selectPrev(): void {
    if (items.length < 1) {
      selected = undefined;
    } else {
      if (selected === items[0]) {
        selected = items[items.length - 1];
      } else {
        for (let i = items.length - 1; i > 0; i--) {
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
    if (!selected || selected === items[items.length - 1]) {
      selected = items[0];
      return;
    }
    for (let i = 0; i < items.length - 1; i++) {
      if (selected === items[i]) {
        selected = items[i + 1];
        break;
      }
    }
  }

  function keydownEventHandler(ev: KeyboardEvent): void {
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

    if (keyCode === Keys.Enter) {
      if (selected) {
        onSelect(selected, input);
        clear();
      }

      if (preventSubmit) {
        ev.preventDefault();
      }
    }
  }

  function focusEventHandler(): void {
    if (showOnFocus) {
      startFetch(EventTrigger.Focus);
    }
  }

  function startFetch(trigger: EventTrigger) {
    // if multiple keys were pressed, before we get update from server,
    // this may cause redrawing our typeahead multiple times after the last key press.
    // to avoid this, the number of times keyboard was pressed will be
    // saved and checked before redraw our typeahead box.
    const savedKeypressCounter = ++keypressCounter;

    const val = input.value;
    if (val.length >= minLen || trigger === EventTrigger.Focus) {
      clearDebounceTimer();
      debounceTimer = window.setTimeout(
        function (): void {
          config.fetch(
            val,
            function (elements: T[] | false): void {
              if (keypressCounter === savedKeypressCounter && elements) {
                items = elements;
                inputValue = val;
                selected = items.length > 0 ? items[0] : undefined;
                update();
              }
            },
            EventTrigger.Keyboard
          );
        },
        trigger === EventTrigger.Keyboard ? debounceWaitMs : 0
      );
    } else {
      clear();
    }
  }

  function blurEventHandler(): void {
    // we need to delay clear, because when we click on an item, blur will be called before click and remove items from DOM
    setTimeout(() => {
      if (doc.activeElement !== input) {
        clear();
      }
    }, 200);
  }

  /**
   * Fixes #26: on long clicks focus will be lost and onSelect method will not be called
   */
  container.addEventListener('mousedown', function (evt: Event) {
    evt.stopPropagation();
    evt.preventDefault();
  });

  /**
   * Fixes #30: typeahead closes when scrollbar is clicked in IE
   * See: https://stackoverflow.com/a/9210267/13172349
   */
  container.addEventListener('focus', () => input.focus());

  /**
   * This function will remove DOM elements and clear event handlers
   */
  function destroy(): void {
    input.removeEventListener('focus', focusEventHandler);
    input.removeEventListener('keydown', keydownEventHandler);
    input.removeEventListener(keyUpEventName, keyupEventHandler as EventListenerOrEventListenerObject);
    input.removeEventListener('blur', blurEventHandler);
    window.removeEventListener('resize', resizeEventHandler);
    doc.removeEventListener('scroll', scrollEventHandler, true);
    clearDebounceTimer();
    clear();
  }

  // setup event handlers
  input.addEventListener('keydown', keydownEventHandler);
  input.addEventListener(keyUpEventName, keyupEventHandler as EventListenerOrEventListenerObject);
  input.addEventListener('blur', blurEventHandler);
  input.addEventListener('focus', focusEventHandler);
  window.addEventListener('resize', resizeEventHandler);
  doc.addEventListener('scroll', scrollEventHandler, true);

  return {
    destroy,
  };
}
