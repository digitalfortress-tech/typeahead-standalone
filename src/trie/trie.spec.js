import { Trie } from './trie';

const colors = [
  { label: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { label: 'Brown', value: 'BR', hash: 'brown' },
  { label: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { label: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
  { label: 'Peach', value: 'PP', hash: 'peach' },
  { label: 'Purple', value: 'PP', hash: 'purple' },
];

describe('Trie algorithm', () => {
  it('Calling Trie methods directly must throw', () => {
    expect(() => Trie.update()).toThrow();
    expect(() => Trie.search('romane')).toThrow();
  });

  it('add(): Passing Object[] without identifier must not be added to trie', () => {
    const trie = new Trie();
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
      const trie = new Trie();
      trie.add();
    }).not.toThrow();
    expect(() => {
      const trie = new Trie();
      trie.add('roman');
    }).not.toThrow();
  });

  it('add(): Passing single strings must be added to trie', () => {
    const trie = new Trie();
    trie.add('John');
    trie.add('James');
    let suggestions = trie.search('j');
    expect(suggestions).toStrictEqual(['James', 'John']);
  });

  it('search(): Passing null/undefined instead of string must throw', () => {
    const trie = new Trie();
    trie.add(['roman', 'romanesque']);
    expect(() => trie.search()).toThrow();
  });

  it('search(): Passing empty string returns all items in tree', () => {
    const trie = new Trie();
    trie.add(['roman', 'romanesque']);
    expect(trie.search('')).toStrictEqual(['roman', 'romanesque']);
  });

  it('search(): Lists expected suggestions from String array', () => {
    const words = ['roman', 'romanesque', 'romanesco', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = new Trie();
    trie.add(words);
    const suggestions = trie.search('romane');
    expect(suggestions).toStrictEqual(['romanei', 'another romaneid', 'romanesco', 'romanesque']);
  });

  it('search(): Lists expected suggestions from Object array', () => {
    const trie = new Trie();
    trie.add(colors, 'label');
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

  it('supports case insensitive prefix', () => {
    const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = new Trie();
    trie.add(words);
    const suggestions = trie.search('romane');
    expect(suggestions).toStrictEqual(['romanei', 'another romaneid', 'ROmanesCo', 'romAneSquE']);
  });

  it('limits suggestions to 2', () => {
    const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'romanex', 'romaney', 'romanez', 'romanei', 'romanif'];
    const trie = new Trie();
    trie.add(words);
    const suggestions = trie.search('romane', '', 2);
    expect(suggestions).toStrictEqual(['romanei', 'romanez']);
  });

  it('gets suggestions for same identifiers / collision test', () => {
    const trie = new Trie();
    trie.add(colors, 'label'); // identifier (first is always identifier)
    trie.add(colors, 'value'); // token
    const expectedResult = [
      { label: 'Peach', value: 'PP', hash: 'peach' },
      { label: 'Purple', value: 'PP', hash: 'purple' },
    ];

    // search without identifier
    let suggestions = trie.search('pp');
    expect(suggestions).toStrictEqual(expectedResult);

    // search with identifier
    suggestions = trie.search('pp', 'label');
    expect(suggestions).toStrictEqual(expectedResult);

    // search with token (does not return all results since it treats "value" keys as unique and that's what is expected)
    suggestions = trie.search('pp', 'value');
    expect(suggestions).toStrictEqual([{ label: 'Purple', value: 'PP', hash: 'purple' }]);
  });
});
