# Typeahead-standalone.js 

[![npm version](https://img.shields.io/npm/v/typeahead-standalone.svg)](https://www.npmjs.com/package/typeahead-standalone)
[![Build Status](https://travis-ci.org/niketpathak/typeahead-standalone.svg?branch=master)](https://travis-ci.org/niketpathak/typeahead-standalone) 
[![code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
![Downloads](https://img.shields.io/npm/dt/typeahead-standalone) 
![maintained](https://img.shields.io/badge/maintained-yes-blueviolet) 
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![speed blazing](https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-9cf.svg)](https://twitter.com/acdlite/status/974390255393505280)

---
A fast fully-featured standalone autocomplete library

**Typeahead-standalone.js**

- is a vastly performant blazing fast autocomplete library in pure javascript
- has **NO DEPENDENCIES** :D  and is a light-weight library [![](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/typeahead-standalone?compression=gzip)](https://cdn.jsdelivr.net/npm/typeahead-standalone)
- it is a highly customizable library
- supports all major browsers (sorry IE, no support for you)
- is completely free and open source
---

### Demo

Here is a **[Live Demo](https://typeahead.niketpathak.com/)** of **typeahead-standalone.js** in action.

## Install

```shell script
# you can install typeahead with npm
$ npm install --save typeahead-standalone

# Alternatively you can use Yarn
$ yarn add typeahead-standalone
```
Then include the library in your App/Page.

**As a module,** 
```javascript
// using ES6 modules
import { typeahead } from 'typeahead-standalone';

// using CommonJS modules
var typeahead = require("typeahead-standalone");
```

**In the browser context,**
```html
<!-- Include the library -->
<script src="./node_modules/typeahead-standalone/dist/typeahead-standalone.js"></script>

<!-- Alternatively, you can use a CDN with jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/typeahead-standalone"></script>
<!-- or with unpkg.com -->
<script src="https://unpkg.com/typeahead-standalone@1.2.0/dist/typeahead-standalone.js"></script>
```
The library will be available as a global object at `window.typeahead`

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

typeahead({
    input: input,
    fetch: function(text, update) {
        text = text.toLowerCase();
        // you can also make AJAX requests instead of using local data
        var suggestions = colors.filter(n => n.label.toLowerCase().startsWith(text))
        update(suggestions);
    },
    // onSelect: function(item) {
    //     input.value = item.label;
    // }
});
```
#### Styling (css)

Some basic styling is added to typeahead by default. However the UI is completely upto you and is customizable to the very pixel. You can override styling using the following classes.

- The entire html is wrapped in a container with a class `typeahead-standalone`.
- The original input element gets an additional class `tt-input`
- The list of suggestions is wrapped in a container with a class `tt-list`. A custom class may be used in addition. (See config option `className`)
- Each suggestion has a `tt-suggestion` class
- Each selected suggestion has a `tt-selected` class
- Each group has a `tt-group` class

```css
/* override background on hover */
.typeahead-standalone .tt-list .tt-suggestion:hover {
  background: red;
}
```

## Configuration

You can pass the following config options to `typeahead-standalone`:

| Parameter | Description | Default |
| --------- | ----------- | ------- |
|`input`|DOM input element must be passed with this parameter and typeahead will attach itself to this field. |`-`|
|`fetch`|This method will be called to prepare suggestions and then pass them to typeahead. The first parameter is the text in the input field. The second parameter is a callback function that must be called after suggestions are prepared with an array as parameter. If you pass `false` to the callback function, previous suggestions would be shown.|`-`|
|`onSelect`|This method will be called when the user chooses an item from the suggestions. The selected item will be passed as first parameter.|Sets labels text as input's value|
|`minLength`|Specify the minimum length, when suggestions should appear on the screen.|`1`|
|`limit`|Specify the maximum number of suggestions that should be displayed.|`5`|
|`highlight`| If set to true, the matched letters are highlighted in the list of suggestions. A class `tt-highlight` is added to facilitate styling|`undefined`|
|`hint`| Updates the input placeholder to be equal to the first matched suggestion. A class `tt-hint` is added to facilitate styling|`true`|
|`renderGroup`|This method allows you to override the rendering function for each group. The first parameter of the function will be the group name. The current input field value will be passed as second parameter. This function must return a `DIV` element or `undefined` to skip rendering.|`undefined`|
|`className`|The typeahead-standalone container will have this class name if specified.|`undefined`|
|`debounceWaitMs`|Enforces that the `fetch` function will only be called once within the specified time frame (in milliseconds) and delays execution. This prevents flooding your server with AJAX requests.|`0`|
|`preventSubmit`|Prevents automatic form submit when ENTER is pressed.|`false`|
|`templates`|An object containing templates for header, footer, suggestion, notFound and pending state. See example below |`undefined`|

---
### Templates

Templates can be used to customize the rendering of the List. Their usage is completely optional.

```javascript
templates: { 
  header: '<h1>List of Countries</h1>', /* Rendered at the top of the dataset */
  footer: '<div>See more</div>', /* Rendered at the bottom of the dataset */
  suggestion: function(item) { /* Used to render a single suggestion */
    return '<div class="custom-class">' + item.label + '</div>'; 
  },
  notFound: '<div>Nothing Found</div>', /* Rendered if 0 suggestions are available */
}
```

Each template gets wrapped in a `div` with its corresponding class. i.e.
`header` => class `tt-header`
`footer` => class `tt-footer`
`suggestion` => class `tt-suggestion`
`notFound` => class `tt-notFound`

### API

* [`typeahead.destroy()`](#typeaheaddestroy)

#### <a id="typeaheaddestroy">typeahead.`destroy()`</a>

Destroys the typeahead instance, removes all event handlers and cleans up the DOM. Can be used once when you no more want to have suggestions.

```javascript
var typeaheadInstance = typeahead({ /* options */ });
typeaheadInstance.destroy();
```

### Contribute

Interested in contributing features and fixes?

[Read more on contributing](./contributing.md).

### Changelog

See the [Changelog](https://github.com/niketpathak/typeahead-standalone/wiki/Changelog)

### License

[MIT](LICENSE) © [Niket Pathak](https://niketpathak.com)