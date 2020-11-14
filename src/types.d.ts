import type { EventTrigger } from './constants';

export interface typeaheadItem {
  label: string;
  group?: string;
}

export interface typeaheadDataSource {
  local?: Record<string, unknown>[];
  // prefetch?: string;
  remote?: {
    url: string;
    wildcard: string;
    method?: string;
  };
  identifier?: string;
}

export interface typeaheadHtmlTemplates<T extends typeaheadItem> {
  header?: string;
  footer?: string;
  suggestion: (item?: T) => string;
  group: (groupName?: string) => string;
  notFound?: string;
  // pending?: string;
}

export interface typeaheadConfig<T extends typeaheadItem> {
  input: HTMLInputElement;
  className?: string;
  minLength?: number;
  limit?: number;
  hint?: boolean;
  highlight?: boolean;
  onSelect?: (item: T, input: HTMLInputElement) => void;
  fetch: (text: string, update: (items: T[] | false) => void, trigger: EventTrigger) => void;
  debounceWaitMs?: number;
  preventSubmit?: boolean; // Prevents automatic form submit when ENTER is pressed
  source?: typeaheadDataSource;
  normalizer?: (listItems: string[] | Record<string, unknown>[], label?: string) => string[];
  templates?: typeaheadHtmlTemplates<T>;
}

export interface typeaheadResult {
  destroy: () => void;
}
