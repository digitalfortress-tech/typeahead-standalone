// import type { Dictionary, typeaheadConfig, typeaheadResult } from './common.d.ts';
import 'common.d.ts';

// Declare the module
declare module 'typeahead-standalone' {
  // generated via plugin-dts

  /**
   * Typeahead-standalone - A fast fully-featured standalone autocomplete library
   * @param config The configuration object. Find complete config options at https://typeahead.digitalfortress.tech/#config
   * @returns The typeahead instance.
   *
   * @example
   *
   * // A basic example. For more examples: https://typeahead.digitalfortress.tech/#playground
   * typeahead({
   *  input: document.querySelector('.search'),
   *  source: {
   *    local: ["Blue", "Black", "Blonde"],
   *  },
   * });
   */
  function typeahead<T extends Dictionary>(config: typeaheadConfig<T>): typeaheadResult<T>;
  export default typeahead;
}
