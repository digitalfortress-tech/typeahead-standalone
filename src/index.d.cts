// import type { Dictionary, typeaheadConfig, typeaheadResult } from './common.d.ts';
import 'common.d.ts';

// Declare the module
declare module 'typeahead-standalone' {
  // generated via plugin-dts
  function typeahead<T extends Dictionary>(config: typeaheadConfig<T>): typeaheadResult<T>;
  export default typeahead;
}
