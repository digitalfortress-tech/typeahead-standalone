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

  it('add(): Passing Object[] without identifier must not be added to trie', () => {
    const trie = Trie();
    trie.add([
      { name: 'Blue', value: 'BL', hash: 'blue' },
      { name: 'Brown', value: 'BR', hash: 'brown' },
    ]);
    let suggestions = trie.search('b');
    expect(suggestions).toStrictEqual([]);
    suggestions = trie.search('b', 'name');
    expect(suggestions).toStrictEqual([]);
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
    let suggestions = trie.search('j');
    expect(suggestions).toStrictEqual(['James', 'John']);
  });

  it('search(): Passing empty string returns all items in tree', () => {
    const trie = Trie();
    trie.add(['roman', 'romanesque']);
    expect(trie.search('')).toStrictEqual(['roman', 'romanesque']);
  });

  it('search(): Lists expected suggestions from String array', () => {
    const words = ['roman', 'romanesque', 'romanesco', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = Trie();
    trie.add(words);
    const suggestions = trie.search('romane');
    expect(suggestions).toStrictEqual(['romanei', 'another romaneid', 'romanesco', 'romanesque']);
  });

  it('search(): Lists expected suggestions from space separated String array', () => {
    const words = ['Superman', 'Batman', 'Flash', 'Aquaman', 'Wonder woman'];
    const trie = Trie();
    trie.add(words);
    const suggestions = trie.search('wo');
    expect(suggestions).toStrictEqual(['Wonder woman']);
  });

  it('search(): Lists expected suggestions from Object array', () => {
    const trie = Trie();
    trie.add(colors, 'label', (param) => `${param.label}`);
    const suggestions = trie.search('b');
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
  });

  it('search(): Lists expected suggestions with diacritics enabled', () => {
    const words = ['Kraków', 'Łódź', 'Wrocław', 'Gdańsk', 'Częstochowa', 'Bielsko-Biała', 'Rzeszów', 'Ruda Śląska'];
    const trie = Trie({ hasDiacritics: true });
    trie.add(words);
    let suggestions = trie.search('Krako');
    expect(suggestions).toStrictEqual(['Kraków']);

    suggestions = trie.search('Gdań');
    expect(suggestions).toStrictEqual(['Gdańsk']);
  });

  it('search(): Lists expected suggestions with diacritics disabled', () => {
    const words = ['Kraków', 'Łódź', 'Wrocław', 'Gdańsk', 'Częstochowa', 'Bielsko-Biała', 'Rzeszów', 'Ruda Śląska'];
    const trie = Trie();
    trie.add(words);
    let suggestions = trie.search('Krako');
    expect(suggestions).toStrictEqual([]);

    suggestions = trie.search('Gdan');
    expect(suggestions).toStrictEqual([]);

    suggestions = trie.search('Łó');
    expect(suggestions).toStrictEqual(['Łódź']);
  });

  it('supports case insensitive prefix', () => {
    const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = Trie();
    trie.add(words);
    const suggestions = trie.search('romane');
    expect(suggestions).toStrictEqual(['romanei', 'another romaneid', 'ROmanesCo', 'romAneSquE']);
  });

  it('limits suggestions to 2', () => {
    const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'romanex', 'romaney', 'romanez', 'romanei', 'romanif'];
    const trie = Trie();
    trie.add(words);
    const suggestions = trie.search('romane', 2);
    expect(suggestions).toStrictEqual(['romanei', 'romanez']);
  });

  it('gets suggestions for same identifiers / collision test', () => {
    const trie = Trie();
    trie.add(colors, 'label', (param) => `${param.label}`); // identifier (first is always identifier)
    trie.add(colors, 'value', (param) => `${param.label}`); // token
    const expectedResult = [
      { label: 'Peach', value: 'PP', hash: 'peach' },
      { label: 'Purple', value: 'PP', hash: 'purple' },
    ];

    // search must return both matching values
    let suggestions = trie.search('pp');
    expect(suggestions).toStrictEqual(expectedResult);

    suggestions = trie.search('pur');
    expect(suggestions).toStrictEqual([{ label: 'Purple', value: 'PP', hash: 'purple' }]);

    // songs with same title and different authors and a custom identity fn
    trie.clear();
    trie.add(songs, 'title', (param) => `${param.title}##${param.artist}`);
    trie.add(songs, 'artist', (param) => `${param.title}##${param.artist}`);

    suggestions = trie.search('He is');
    expect(suggestions).toHaveLength(2);

    suggestions = trie.search('Wil');
    expect(suggestions).toHaveLength(1);
  });
});
