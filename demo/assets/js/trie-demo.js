// eslint-disable-next-line no-undef
const test = typeahead({
  input: document.getElementById('input-one'),
  source: {
    local: ['Gold', 'Green', 'Grey'],
  },
  className: 'typeahead-test-one',
});

const trie = test.trie();
trie.clear();
console.log(' **** CLEARED **** ');

const colors = [
  { name: 'Red', value: 'RD', hash: 'red' },
  { name: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { name: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Darker', value: 'DBL', hash: 'mnamenightblue', group: 'Shades of Blue' },
  { name: 'Blue Light', value: 'LBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { name: 'Blue Extra Light', value: 'LBL', hash: 'aliceblue', group: 'Shades of Blue' },
  { name: 'Yellow', value: 'YW', hash: 'yellow' },
  { name: 'Gold', value: 'GD', hash: 'gold' },
  { name: 'Silver', value: 'SV', hash: 'silver' },
  { name: 'Baige', value: 'BG', hash: '#352e2e' },
  { name: 'Orange', value: 'OR', hash: 'orange' },
  { name: 'Green', value: 'GRN', hash: 'green' },
  { name: 'White', value: 'WH', hash: 'white' },
  { name: 'Pink', value: 'PN', hash: 'pink' },
  { name: 'Purple', value: 'PR', hash: 'purple' },
  { name: 'Grey', value: 'GRY', hash: 'grey' },
  { name: 'Brown', value: 'BR', hash: 'brown' },
  { name: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { name: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
  { name: 'Peach', value: 'PN', hash: 'peach' },
  { name: 'Plum', value: 'PN', hash: 'plum' },
];

const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'cat', 'category', 'romanei', 'another romaneid'];

/********************************* TEST ON STRINGS ***************************************/

// trie.addAll(words);
// console.log('trie1 :>> ', trie.find('romane'));

/********************************* TEST ON OBJECTS ***************************************/

trie.addAll(colors, 'name');
trie.addAll(colors, 'value');
console.log('trie2 :>> ', trie.find('b', 5, 'name'));

/********************************* NEXT ***************************************/
