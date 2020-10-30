import type { EventTrigger } from './constants';

export interface typeaheadItem {
  label: string;
  group?: string;
}

export interface typeaheadHtmlTemplates<T extends typeaheadItem> {
  header?: string;
  footer?: string;
  suggestion?: (item?: T) => string;
  notFound?: string;
  pending?: string;
}

export interface typeaheadConfig<T extends typeaheadItem> {
  input: HTMLInputElement;
  renderGroup?: (name: string, currentValue: string) => HTMLDivElement | undefined;
  className?: string;
  minLength?: number;
  limit?: number;
  hint?: boolean;
  highlight?: boolean;
  emptyMsg?: string;
  onSelect?: (item: T, input: HTMLInputElement) => void;
  fetch: (text: string, update: (items: T[] | false) => void, trigger: EventTrigger) => void;
  debounceWaitMs?: number;
  /**
   * Prevents automatic form submit when ENTER is pressed
   */
  preventSubmit?: boolean;
  templates?: typeaheadHtmlTemplates<T>;
}

export interface typeaheadResult {
  destroy: () => void;
}
