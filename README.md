# Typeahead-standalone.js

A fast fully-featured standalone autocomplete library

**Typeahead-standalone.js**

- is a vastly performant autocomplete library in pure Javascript
- has **NO DEPENDENCIES** :D 
- is a light-weight library
- it is a highly customizable library
- is completely free and open source
---
### Demo

Coming soon...

---

## Install

```shell script
# you can install ad-rotator with npm
$ npm install --save typeahead-standalone

# Alternatively you can use Yarn
$ yarn add typeahead-standalone
```
Then include the library in your App/Page.

**As a module,** 
```javascript
// using ES6 modules
import typeaheadStandalone from 'typeahead-standalone'

// using CommonJS modules
var typeahead = require("typeahead-standalone")
```

**In the browser context,**
```html
<!-- Include the library -->
<script src="./node_modules/typeahead-standalone/dist/typeahead-standalone.js"></script>

<!-- Alternatively, you can use a CDN -->
<script src="https://cdn.jsdelivr.net/npm/typeahead-standalone"></script>
```
The library will be available as a global object at `window.typeaheadStandalone`

## Usage

Typeahead requires an `input` Element to attach itself to and a `Data source` (local, remote) to display suggestions. 

Here is a basic example

#### Html

```html
<!-- include the library -->
<script src="..." async></script>

<!-- Html markup -->
<input type="text" id="searchInput" autocomplete="off" placeholder="Search...">
```
#### Javascript

```javascript
// local Data
var colors = [
  { label: 'Grey', value: 'GR' },
  { label: 'Brown', value: 'BR' },
  { label: 'Black', value: 'BK', group: 'Shades of Black' },
  { label: 'Black Xtra', value: 'XBK', group: 'Shades of Black' },
];

// input element to attach to
var input = document.getElementById("searchInput");

typeaheadStandalone({
    input: input,
    fetch: function(text, update) {
        text = text.toLowerCase();
        // you can also make AJAX requests instead of using local data
        var suggestions = colors.filter(n => n.label.toLowerCase().startsWith(text))
        update(suggestions);
    },
    onSelect: function(item) {
        input.value = item.label;
    }
});
```
#### Styling (css)

Some basic styling is added to typeahead by default. However the UI is completely upto you and is customizable to the very pixel. You can override styling using the following classes.

- The container has a `typeahead-standalone` class added to it
- Each suggestion has a `tt-suggestion` class
- Each group has a `tt-group` class

```css
.typeahead-standalone .tt-suggestion:hover {
  color: red;
}
```

## Configuration

You can pass the following options to `typeahead-standalone`:

| Parameter | Description | Default |
| --------- | ----------- | ------- |
|`input`|DOM input element must be passed with this parameter and typeahead-standalone will attach itself to this field. |`-`|
|`onSelect`|This method will be called when the user chooses an item from the suggestions. The selected item will be passed as first parameter.|`-`|
|`minLength`|Specify the minimum length, when suggestions should appear on the screen.|`2`|
|`emptyMsg`|The message that will be showed when there are no suggestions that match the entered value.|`undefined`|
|`render`|This method allows you to override the rendering function. It will be called for each suggestion and the suggestion object will be passed as first parameter. The current input field value will be passed as second parameter. This function must return a DIV element or `undefined` to skip rendering.|`undefined`|
|`renderGroup`|The same as `render`, but will be called for each group. The first parameter of the function will be the group name. The current input field value will be passed as second parameter. This function must return a `DIV` element or `undefined` to skip rendering.|`undefined`|
|`className`|The typeahead-standalone container will have this class name if specified.|`undefined`|
|`fetch`|This method will be called to prepare suggestions and then pass them to typeahead-standalone. The first parameter is the text in the input field. The second parameter is a callback function that must be called after suggestions are prepared with an array as parameter. If you pass `false` to the callback function, previous suggestions would be shown.|`-`|
|`debounceWaitMs`|Enforces that the `fetch` function will only be called once within the specified time frame (in milliseconds) and delays execution. This prevents flooding your server with AJAX requests.|`0`|
|`customize`|Callback for additional customization after rendering is finished. Use this function if you want to change the default position of the list of suggestions.|`undefined`|
|`preventSubmit`|Prevents automatic form submit when ENTER is pressed.|`false`|
|`showOnFocus`|Displays suggestions on focus of the input element. Note that if `true`, the minLength property will be ignored and it will always call `fetch`.|`false`|

### API

* [`typeahead.destroy()`](#typeaheaddestroy)

#### <a id="typeaheaddestroy">typeahead.`destroy()`</a>

Destroys the typeahead instance, removes all event handlers and cleans up the DOM. Can be used once when you no more want to have suggestions.

```javascript
var typeahead = typeaheadStandalone({ /* options */ });
typeahead.destroy();
```

### Contribute

Interested in contributing features and fixes?

[Read more on contributing](./contributing.md).

### Changelog

See the [Changelog](https://github.com/niketpathak/typeahead-standalone/wiki/Changelog)

### License

[MIT](LICENSE) © [Niket Pathak](https://niketpathak.com)