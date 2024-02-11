import type { Dictionary, typeaheadConfig, typeaheadResult } from './common.d.ts';

declare module 'typeahead-standalone';

declare function typeahead<T extends Dictionary>(config: typeaheadConfig<T>): typeaheadResult<T>;
export default typeahead;

// Types can be verified at https://arethetypeswrong.github.io/