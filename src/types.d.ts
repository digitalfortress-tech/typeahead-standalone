export interface typeaheadItem {
  label: string;
  group?: string;
}

export interface typeaheadDataSource {
  local?: Record<string, unknown>[];
  remote?: {
    url: string;
    wildcard: string;
  };
  prefetch?: {
    url: string;
    startEvent?: 'onInit' | 'onFocus';
    done: boolean;
  };
  transform?: (data: string[] | Record<string, unknown>[]) => string[] | Record<string, unknown>[];
  identifier?: string;
}

export interface typeaheadHtmlTemplates<T extends typeaheadItem> {
  header?: string;
  footer?: string;
  suggestion: (item?: T) => string;
  group?: (groupName?: string) => string;
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
  debounceRemote?: number;
  preventSubmit?: boolean; // Prevents automatic form submit when ENTER is pressed
  source?: typeaheadDataSource;
  normalizer?: (listItems: string[] | Record<string, unknown>[], label?: string) => string[];
  templates?: typeaheadHtmlTemplates<T>;
}

export interface typeaheadResult {
  destroy: () => void;
}
