const colors = [
  { name: 'Red', value: 'RD', hash: 'red' },
  { name: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { name: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Darker', value: 'DBXL', hash: 'mnamenightblue', group: 'Shades of Blue' },
  { name: 'Blue Light', value: 'LBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { name: 'Blue Extra Light', value: 'LBLX', hash: 'aliceblue', group: 'Shades of Blue' },
  { name: 'Yellow', value: 'YW', hash: 'yellow' },
  { name: 'Gold', value: 'GD', hash: 'gold' },
  { name: 'Silver', value: 'SV', hash: 'silver' },
  { name: 'Baige', value: 'BG', hash: '#352e2e' },
  { name: 'Orange', value: 'OR', hash: 'orange' },
  { name: 'Green', value: 'GR', hash: 'green' },
  { name: 'White', value: 'WH', hash: 'white' },
  { name: 'Pink', value: 'PI', hash: 'pink' },
  { name: 'Purple', value: 'PR', hash: 'purple' },
  { name: 'Grey', value: 'GR', hash: 'grey' },
  { name: 'Brown', value: 'BR', hash: 'brown' },
  { name: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { name: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
];

// eslint-disable-next-line no-undef
const test1 = typeahead({
  input: document.getElementById('input-one'),
  source: {
    local: ['Gold', 'Green', 'Grey'],
  },
  className: 'typeahead-test-one',
});

// eslint-disable-next-line no-undef
const test2 = typeahead({
  input: document.getElementById('input-two'),
  source: {
    local: colors,
    identifier: 'name',
  },
  className: 'typeahead-test-two',
  minLength: 2,
  highlight: true,
});

// eslint-disable-next-line no-undef
const test3 = typeahead({
  input: document.getElementById('input-three'),
  source: {
    local: colors,
    identifier: 'name',
    groupIdentifier: 'group',
  },
  className: 'typeahead-test-three',
  highlight: true,
});

// eslint-disable-next-line no-undef
const test4 = typeahead({
  input: document.getElementById('input-four'),
  source: {
    local: colors,
    identifier: 'name',
    groupIdentifier: 'group',
  },
  className: 'typeahead-test-four',
  highlight: true,
  templates: {
    suggestion: (item) => {
      return (
        '<span class="preview" style="background-color:' +
        item.hash +
        '"></span><div class="text">' +
        item.name +
        '</div>'
      );
    },
    group: (name) => {
      return '<div class="custom-group">' + name + '</div>';
    },
    header: 'Colors Found',
    footer: '<a href="#">See more...</a>',
    notFound: 'Oops...Nothing Found 😪 <br>Try another color...',
  },
});

// eslint-disable-next-line no-undef
const test5 = typeahead({
  input: document.getElementById('input-five'),
  source: {
    local: colors,
    identifier: 'name',
    groupIdentifier: 'group',
    dataTokens: ['value'],
  },
  className: 'typeahead-test-five',
  highlight: true,
});

// eslint-disable-next-line no-undef
const test6 = typeahead({
  input: document.getElementById('input-six'),
  source: {
    remote: {
      url: 'https://restcountries.eu/rest/v2/name/%QUERY',
      wildcard: '%QUERY',
    },
    identifier: 'name',
    dataTokens: ['capital'],
  },
  className: 'typeahead-test-six',
  highlight: true,
  templates: {
    suggestion: (item) => {
      return item.name + ', ' + item.capital;
    },
  },
});

// eslint-disable-next-line no-undef
const test7 = typeahead({
  input: document.getElementById('input-seven'),
  source: {
    prefetch: {
      url: 'https://restcountries.eu/rest/v2/name/p',
      when: 'onFocus',
    },
    identifier: 'name',
    dataTokens: ['capital'],
  },
  className: 'typeahead-test-seven',
  highlight: true,
  templates: {
    suggestion: (item) => {
      return item.name + ', ' + item.capital;
    },
  },
});
