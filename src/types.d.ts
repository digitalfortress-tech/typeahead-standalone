export type Dictionary<T = unknown> = Record<string, T>;

export interface typeaheadDataSource {
  local?: Dictionary[];
  remote?: {
    url: string;
    wildcard: string;
  };
  prefetch?: {
    url: string;
    when?: 'onInit' | 'onFocus';
    done: boolean;
  };
  transform?: (data: string[] | Dictionary[]) => string[] | Dictionary[];
  identifier?: 'label' | string;
  groupIdentifier?: string;
}

export interface typeaheadHtmlTemplates<T extends Dictionary> {
  header?: string;
  footer?: string;
  suggestion: (item?: T) => string;
  group?: (groupName?: string) => string;
  notFound?: string;
  // pending?: string;
}

export interface typeaheadConfig<T extends Dictionary> {
  input: HTMLInputElement;
  className?: string;
  minLength?: number;
  limit?: number;
  hint?: boolean;
  highlight?: boolean;
  onSelect?: (item: T, identifier: string, input: HTMLInputElement) => void;
  debounceRemote?: number;
  preventSubmit?: boolean; // Prevents automatic form submit when ENTER is pressed
  source?: typeaheadDataSource;
  normalizer?: (listItems: string[] | Dictionary[] | T[], identifier: string) => string[];
  templates?: typeaheadHtmlTemplates<T>;
}

export interface typeaheadResult {
  destroy: () => void;
}
