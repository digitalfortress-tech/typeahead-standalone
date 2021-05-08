import { Trie } from './trie';

describe('Trie algorithm', () => {
  it('Calling Trie methods directly must throw', () => {
    expect(() => Trie.update()).toThrow();
    expect(() => Trie.find('romane')).toThrow();
  });

  it('addAll(): Passing anything other than iterable(array) must throw', () => {
    expect(() => {
      const trie = new Trie();
      trie.addAll();
    }).toThrow();
    expect(() => {
      const trie = new Trie();
      trie.addAll({});
    }).toThrow();
    expect(() => {
      const trie = new Trie();
      trie.addAll('roman');
    }).toThrow();
  });

  it('find(): Passing null/undefined instead of string must throw', () => {
    const trie = new Trie();
    trie.addAll(['roman', 'romanesque']);
    expect(() => trie.find()).toThrow();
  });

  it('find(): Passing empty string returns all items in tree', () => {
    const trie = new Trie();
    trie.addAll(['roman', 'romanesque']);
    expect(trie.find('')).toStrictEqual(['roman', 'romanesque']);
  });

  it('Trie lists expected suggestions from String array', () => {
    const words = ['roman', 'romanesque', 'romanesco', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = new Trie();
    trie.addAll(words);
    const suggestions = trie.find('romane');
    expect(suggestions).toStrictEqual(['romanei', 'another romaneid', 'romanesco', 'romanesque']);
  });

  it('Trie lists expected suggestions from Object array', () => {
    const words = [
      { label: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
      { label: 'Brown', value: 'BR', hash: 'brown' },
      { label: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
      { label: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
    ];

    const trie = new Trie();
    trie.addAll(words);
    const suggestions = trie.find('b');
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

  it('Trie provides suggestions for case insensitive prefix', () => {
    const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = new Trie();
    trie.addAll(words);
    const suggestions = trie.find('romane');
    expect(suggestions).toStrictEqual(['romanei', 'another romaneid', 'ROmanesCo', 'romAneSquE']);
  });

  it('Trie limit found suggestions to 2', () => {
    const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'romanex', 'romaney', 'romanez', 'romanei', 'romanif'];
    const trie = new Trie();
    trie.addAll(words);
    const suggestions = trie.find('romane', '', 2);
    expect(suggestions).toStrictEqual(['romanei', 'romanez']);
  });

  // @todo: write tests to use all parameters of find + tests for search() method too
});
