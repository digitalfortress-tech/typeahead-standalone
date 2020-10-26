import type { EventTrigger } from './constants';

export interface typeaheadItem {
  label: string;
  group?: string;
}

export interface typeaheadConfig<T extends typeaheadItem> {
  input: HTMLInputElement;
  render?: (item: T, currentValue: string) => HTMLDivElement | undefined;
  renderGroup?: (name: string, currentValue: string) => HTMLDivElement | undefined;
  className?: string;
  minLength?: number;
  limit?: number;
  hint?: boolean;
  highlight?: boolean;
  emptyMsg?: string;
  onSelect?: (item: T, input: HTMLInputElement) => void;
  /**
   * Show typeahead on focus event. Focus event will ignore the `minLength` property and will always call `fetch`.
   */
  showOnFocus?: boolean;
  fetch: (text: string, update: (items: T[] | false) => void, trigger: EventTrigger) => void;
  debounceWaitMs?: number;
  /**
   * Prevents automatic form submit when ENTER is pressed
   */
  preventSubmit?: boolean;
}

export interface typeaheadResult {
  destroy: () => void;
}
