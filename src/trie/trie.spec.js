import { Trie } from './trie';

const colors = [
  { label: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { label: 'Brown', value: 'BR', hash: 'brown' },
  { label: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { label: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
  { label: 'Peach', value: 'PP', hash: 'peach' },
  { label: 'Purple', value: 'PP', hash: 'purple' },
];

const songs = [
  { title: 'He is my everything', artist: 'Don Moen' },
  { title: 'He is my everything', artist: 'Don Moen' },
  { title: 'He is my everything', artist: 'Paul Wilbur' },
  { title: 'He is my everything', artist: 'Paul Wilbur' },
];

describe('Trie algorithm', () => {
  it('Calling Trie methods directly must throw', () => {
    expect(() => Trie.update()).toThrow();
    expect(() => Trie.search('romane')).toThrow();
  });

  it('add(): Passing Object[] without key must not be added to trie', () => {
    const trie = Trie();
    trie.add([
      { name: 'Blue', value: 'BL', hash: 'blue' },
      { name: 'Brown', value: 'BR', hash: 'brown' },
    ]);
    let { suggestions, count } = trie.search('b');
    expect(suggestions).toStrictEqual([]);
    ({ suggestions, count } = trie.search('b', 1));
    expect(suggestions).toStrictEqual([]);
    expect(count).toEqual(0);
  });

  it('add(): passing falsy values to add must not throw', () => {
    expect(() => {
      const trie = Trie();
      trie.add();
    }).not.toThrow();
    expect(() => {
      const trie = Trie();
      trie.add('roman');
    }).not.toThrow();
  });

  it('add(): Passing single strings must be added to trie', () => {
    const trie = Trie();
    trie.add('John');
    trie.add('James');
    let { suggestions, count } = trie.search('j');
    expect(suggestions).toStrictEqual(['James', 'John']);
    expect(count).toEqual(2);
  });

  it('search(): Passing empty string returns all items in tree', () => {
    const trie = Trie();
    trie.add(['roman', 'romanesque']);
    let { suggestions, count } = trie.search('');
    expect(suggestions).toStrictEqual(['roman', 'romanesque']);
    expect(count).toEqual(2);
  });

  it('search(): Lists expected suggestions from String array', () => {
    const words = ['roman', 'romanesque', 'romanesco', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = Trie();
    trie.add(words);
    const { suggestions, count } = trie.search('romane');
    expect(suggestions).toStrictEqual(['romanei', 'another romaneid', 'romanesco', 'romanesque']);
    expect(count).toEqual(4);
  });

  it('search(): Lists expected suggestions from space separated String array', () => {
    const words = ['Superman', 'Batman', 'Flash', 'Aquaman', 'Wonder woman'];
    const trie = Trie();
    trie.add(words);
    const { suggestions, count } = trie.search('wo');
    expect(suggestions).toStrictEqual(['Wonder woman']);
    expect(count).toEqual(1);
  });

  it('search(): Lists expected suggestions from Object array', () => {
    const trie = Trie();
    trie.add(colors, 'label', (param) => `${param.label}`);
    const { suggestions, count } = trie.search('b');
    expect(suggestions).toStrictEqual([
      {
        hash: 'brown',
        label: 'Brown',
        value: 'BR',
      },
      {
        group: 'Shades of Black',
        hash: 'black',
        label: 'Black',
        value: 'BK',
      },
      {
        group: 'Shades of Black',
        hash: '#352e2e',
        label: 'Black Light',
        value: 'LBK',
      },
      {
        group: 'Shades of Blue',
        hash: 'blue',
        label: 'Blue',
        value: 'BL',
      },
    ]);
    expect(count).toEqual(4);
  });

  it('search(): Lists expected suggestions with diacritics enabled', () => {
    const words = ['Kraków', 'Łódź', 'Wrocław', 'Gdańsk', 'Częstochowa', 'Bielsko-Biała', 'Rzeszów', 'Ruda Śląska'];
    const trie = Trie({ hasDiacritics: true });
    trie.add(words);
    let { suggestions, count } = trie.search('Krako');
    expect(suggestions).toStrictEqual(['Kraków']);
    expect(count).toEqual(1);

    ({ suggestions } = trie.search('Gdań'));
    expect(suggestions).toStrictEqual(['Gdańsk']);
  });

  it('search(): Lists expected suggestions with diacritics disabled', () => {
    const words = ['Kraków', 'Łódź', 'Wrocław', 'Gdańsk', 'Częstochowa', 'Bielsko-Biała', 'Rzeszów', 'Ruda Śląska'];
    const trie = Trie();
    trie.add(words);
    let { suggestions } = trie.search('Krako');
    expect(suggestions).toStrictEqual([]);

    ({ suggestions } = trie.search('Gdan'));
    expect(suggestions).toStrictEqual([]);

    ({ suggestions } = trie.search('Łó'));
    expect(suggestions).toStrictEqual(['Łódź']);
  });

  it('supports case insensitive prefix', () => {
    const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = Trie();
    trie.add(words);
    const { suggestions, count } = trie.search('romane');
    expect(suggestions).toStrictEqual(['romanei', 'another romaneid', 'ROmanesCo', 'romAneSquE']);
    expect(count).toEqual(4);
  });

  it('limits suggestions to 2', () => {
    const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'romanex', 'romaney', 'romanez', 'romanei', 'romanif'];
    const trie = Trie();
    trie.add(words);
    const { suggestions, count } = trie.search('romane', 2);
    expect(suggestions).toStrictEqual(['romanei', 'romanez']);
    expect(count).toEqual(6);
  });

  it('gets suggestions for same key / collision test', () => {
    const trie = Trie();
    trie.add(colors, 'label', (param) => `${param.label}`); // first key
    trie.add(colors, 'value', (param) => `${param.label}`); // second key
    const expectedResult = [
      { label: 'Peach', value: 'PP', hash: 'peach' },
      { label: 'Purple', value: 'PP', hash: 'purple' },
    ];

    // search must return both matching values
    let { suggestions } = trie.search('pp');
    expect(suggestions).toStrictEqual(expectedResult);

    ({ suggestions } = trie.search('pur'));
    expect(suggestions).toStrictEqual([{ label: 'Purple', value: 'PP', hash: 'purple' }]);

    // songs with same title and different authors and a custom identity fn
    trie.clear();
    trie.add(songs, 'title', (param) => `${param.title}##${param.artist}`);
    trie.add(songs, 'artist', (param) => `${param.title}##${param.artist}`);

    ({ suggestions } = trie.search('He is'));
    expect(suggestions).toHaveLength(2);

    ({ suggestions } = trie.search('Wil'));
    expect(suggestions).toHaveLength(1);
  });
});

it('handles custom tokenizer correctly', () => {
  // custom hypen tokenizer
  const trie_custom1 = Trie({
    tokenizer: (data) => data.split(/-/),
  });
  const items = ['May-June', 'Dec May', 'August-Sept', 'Sept-May'];
  trie_custom1.add(items);
  let { suggestions } = trie_custom1.search('May');
  expect(suggestions).toStrictEqual(['May-June', 'Sept-May']);

  // custom hypen+space tokenizer
  const trie_custom2 = Trie({
    tokenizer: (data) => data.split(/\s+|-/),
  });
  trie_custom2.add(items);
  ({ suggestions } = trie_custom2.search('May'));
  expect(suggestions).toStrictEqual(['May-June', 'Dec May', 'Sept-May']);

  // default tokenizer
  const trie = Trie();
  trie.add(items);
  ({ suggestions } = trie.search('May'));
  expect(suggestions).toStrictEqual(['Dec May', 'May-June']);
});
