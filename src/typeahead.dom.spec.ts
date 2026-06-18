// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import typeahead from './typeahead-standalone.js';

/**
 * Controller-level tests for the public `typeahead()` factory.
 *
 * These run in jsdom. A few browser APIs the controller touches are not implemented by
 * jsdom, so they are stubbed below:
 *  - ResizeObserver (used to track input width)
 *  - Element.prototype.scrollIntoView (used to scroll the selected suggestion into view)
 *
 * NOTE: Several of these tests intentionally lock in the *current* behavior (Enter/Tab
 * selection, Escape, destroy()) so that the behavioral fixes proposed in the hardening
 * plan (PR4 items 3.1-3.4) can't be changed silently without updating a test.
 */

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const colors = ['Blue', 'Black', 'Blonde', 'Red'];

let input: HTMLInputElement;

const initLocal = (config = {}) =>
  typeahead({
    input,
    source: { local: colors },
    ...config,
  });

// simulate a real user keystroke (the input handler ignores events without a real inputType)
const type = (value: string) => {
  input.value = value;
  input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: value, bubbles: true }));
};

const key = (k: string): KeyboardEvent => {
  const ev = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
  input.dispatchEvent(ev);
  return ev;
};

const suggestions = () => Array.from(document.querySelectorAll('.tt-suggestion')).map((el) => el.textContent);
const isListVisible = () => {
  const list = document.querySelector('.tt-list');
  return !!list && !list.classList.contains('tt-hide');
};

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  Element.prototype.scrollIntoView = vi.fn();
  document.body.innerHTML = '<input class="search" />';
  input = document.body.querySelector('.search') as HTMLInputElement;
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('typeahead() controller', () => {
  test('renders matching local suggestions on input', () => {
    initLocal();
    type('bl');
    // "Blue", "Black", "Blonde" all start with "bl"; sorted shortest-first
    expect(suggestions()).toEqual(['Blue', 'Black', 'Blonde']);
    expect(isListVisible()).toBe(true);
  });

  test('respects the limit option', () => {
    initLocal({ limit: 2 });
    type('bl');
    expect(suggestions()).toHaveLength(2);
  });

  test('hides the list when query is shorter than minLength', () => {
    initLocal({ minLength: 2 });
    type('b');
    expect(isListVisible()).toBe(false);
  });

  describe('keyboard navigation', () => {
    test('ArrowDown selects the first suggestion and preventDefaults', () => {
      initLocal();
      type('bl');
      const ev = key('ArrowDown');
      expect(input.value).toBe('Blue');
      expect(ev.defaultPrevented).toBe(true);
    });

    test('ArrowDown past the last item restores the typed input', () => {
      initLocal();
      type('bl');
      key('ArrowDown'); // Blue
      key('ArrowDown'); // Black
      key('ArrowDown'); // Blonde
      key('ArrowDown'); // wrap back to typed input
      expect(input.value).toBe('bl');
    });
  });

  describe('addToIndex / reset', () => {
    test('addToIndex makes new suggestions searchable', () => {
      const ta = initLocal();
      ta.addToIndex(['Xenon']);
      type('xe');
      expect(suggestions()).toEqual(['Xenon']);
    });

    test('reset() clears non-local items but keeps local ones', () => {
      const ta = initLocal();
      ta.addToIndex(['Xenon']);
      ta.reset();

      type('xe');
      expect(suggestions()).toEqual([]); // Xenon was not a local source item

      type('bl');
      expect(suggestions()).toEqual(['Blue', 'Black', 'Blonde']); // local items survive reset
    });
  });

  describe('PR4 regression — locks in CURRENT behavior (see hardening plan §3)', () => {
    test('3.1 Enter without an explicit selection submits with `undefined`', () => {
      const onSubmit = vi.fn();
      initLocal({ onSubmit });
      type('bl');
      key('Enter');
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][1]).toBeUndefined();
    });

    test('3.1 Tab falls back to selecting the first suggestion', () => {
      initLocal();
      type('bl');
      key('Tab');
      expect(input.value).toBe('Blue');
    });

    test('3.2 Escape clears the list and does NOT preventDefault', () => {
      initLocal();
      type('bl');
      expect(isListVisible()).toBe(true);
      const ev = key('Escape');
      expect(isListVisible()).toBe(false);
      expect(ev.defaultPrevented).toBe(false);
    });

    test('3.4 destroy() replaces the wrapper with a clone of the input', () => {
      const ta = initLocal();
      type('bl');
      ta.destroy();

      // the typeahead DOM (wrapper/list) is gone...
      expect(document.querySelector('.tt-list')).toBeNull();
      // ...the original input node was detached and replaced by a clone
      expect(document.body.contains(input)).toBe(false);
      const replacement = document.body.querySelector('input');
      expect(replacement).not.toBeNull();
      expect(replacement).not.toBe(input);
    });
  });
});
