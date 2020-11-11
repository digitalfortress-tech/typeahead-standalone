import { Trie } from './trie';

describe('Trie algorithm', () => {
  it('Trie lists expected suggestions', () => {
    const words = ['roman', 'romanesque', 'romanesco', 'cat', 'category', 'romanei', 'another romaneid'];
    const trie = Trie(words);
    const suggestions = trie.find('romane');
    expect(suggestions).toStrictEqual(['romanei', 'romanesco', 'romanesque']);
  });
});
