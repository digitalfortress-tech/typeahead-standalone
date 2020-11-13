import { Trie } from './trie';

describe('Trie algorithm', () => {
  it('Calling Trie methods directly must throw', () => {
    expect(() => Trie.update()).toThrow();
    expect(() => Trie.find('romane')).toThrow();
  });

  it('addAll(): Passing anything other than iterable(array) must throw', () => {
    expect(() => new Trie().addAll()).toThrow();
    expect(() => new Trie().addAll({})).toThrow();
    expect(() => new Trie().addAll('roman')).toThrow();
  });

  it('find(): Passing null/undefined instead of string must throw', () => {
    const trie = new Trie().addAll(['roman', 'romanesque']);
    expect(() => trie.find()).toThrow();
  });

  it('find(): Passing empty string returns all items in tree', () => {
    const trie = new Trie().addAll(['roman', 'romanesque']);
    expect(trie.find('')).toStrictEqual(['roman', 'romanesque']);
  });

  it('Trie lists expected suggestions', () => {
    const words = ['roman', 'romanesque', 'romanesco', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = new Trie().addAll(words);
    const suggestions = trie.find('romane');
    expect(suggestions).toStrictEqual(['romanei', 'romanesco', 'romanesque']);
  });
});
